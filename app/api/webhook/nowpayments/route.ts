import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

/**
 * NOWPayments IPN (Instant Payment Notification) Webhook Handler
 *
 * Statuses:
 *   waiting     — initial, customer hasn't paid yet
 *   confirming  — blockchain processing
 *   confirmed   — enough confirmations
 *   sending     — funds being sent to our wallet
 *   finished    — payment complete
 *   partially_paid — customer sent less than required
 *   failed      — error
 *   expired     — no payment within 7 days
 *   refunded    — funds refunded
 *
 * Signature: HMAC-SHA512 hex, header: x-nowpayments-sig
 * Body keys must be sorted before signing.
 */

function sortObject(obj: any): any {
    return Object.keys(obj).sort().reduce((result: any, key: string) => {
        result[key] = obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])
            ? sortObject(obj[key])
            : obj[key];
        return result;
    }, {});
}

function verifySignature(body: any, signatureHeader: string, secret: string): boolean {
    const sorted = sortObject(body);
    const hmac = crypto.createHmac("sha512", secret);
    hmac.update(JSON.stringify(sorted));
    const computed = hmac.digest("hex");
    try {
        return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);

        // ── Verify HMAC-SHA512 signature ─────────────────────
        const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
        if (!ipnSecret) {
            console.error("[NP-WEBHOOK] NOWPAYMENTS_IPN_SECRET not configured");
            return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
        }

        const signature = req.headers.get("x-nowpayments-sig");
        if (!signature || !verifySignature(body, signature, ipnSecret)) {
            console.error("[NP-WEBHOOK] Signature mismatch or missing");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // ── Extract fields ───────────────────────────────────
        const paymentId = body.payment_id;
        const paymentStatus: string = body.payment_status || "";
        const orderId: string = body.order_id || "";

        console.log(`[NP-WEBHOOK] payment_id=${paymentId} status=${paymentStatus} order_id=${orderId}`);

        if (!paymentId) {
            return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
        }

        // Find transaction by moneymotionId (we stored `np_{paymentId}`)
        const txRef = `np_${paymentId}`;
        const transaction = await db.transaction.findUnique({
            where: { moneymotionId: txRef },
        });

        if (!transaction) {
            // Try by order_id (we stored the moneymotionId as order_id)
            const txByOrder = orderId
                ? await db.transaction.findUnique({ where: { moneymotionId: orderId } })
                : null;

            if (!txByOrder) {
                console.error(`[NP-WEBHOOK] Transaction not found for np_${paymentId} or order ${orderId}`);
                return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
            }

            // Update the moneymotionId to use np_ prefix for future lookups
            await db.transaction.update({
                where: { id: txByOrder.id },
                data: { moneymotionId: txRef },
            });

            return await processPayment(txByOrder, paymentStatus, body);
        }

        return await processPayment(transaction, paymentStatus, body);
    } catch (error) {
        console.error("[NP-WEBHOOK] Error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}

async function processPayment(
    transaction: { id: string; userId: string; amountPrx: number; status: string },
    paymentStatus: string,
    body: any
) {
    // ── finished — credit PRX ────────────────────────────
    if (paymentStatus === "finished" || paymentStatus === "confirmed") {
        if (transaction.status === "COMPLETED") {
            return NextResponse.json({ ok: true, message: "Already processed" });
        }

        await db.$transaction([
            db.user.update({
                where: { id: transaction.userId },
                data: { prxBalance: { increment: transaction.amountPrx } },
            }),
            db.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: "COMPLETED",
                    cardLast4: null,
                    cardBrand: (body.pay_currency || "crypto").toUpperCase(),
                },
            }),
        ]);

        console.log(`[NP-WEBHOOK] +${transaction.amountPrx} PRX -> user ${transaction.userId} (${body.pay_currency})`);
        return NextResponse.json({ ok: true, credited: transaction.amountPrx });
    }

    // ── expired / failed — mark FAILED ───────────────────
    if (paymentStatus === "expired" || paymentStatus === "failed") {
        if (transaction.status !== "PENDING") {
            return NextResponse.json({ ok: true, message: "Already processed" });
        }

        await db.transaction.update({
            where: { id: transaction.id },
            data: { status: "FAILED" },
        });

        console.log(`[NP-WEBHOOK] ${paymentStatus} -> FAILED for tx ${transaction.id}`);
        return NextResponse.json({ ok: true });
    }

    // ── refunded — deduct PRX ────────────────────────────
    if (paymentStatus === "refunded") {
        if (transaction.status !== "COMPLETED") {
            return NextResponse.json({ ok: true, message: "Nothing to refund" });
        }

        const user = await db.user.findUnique({ where: { id: transaction.userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newBalance = Math.max(0, user.prxBalance - transaction.amountPrx);

        await db.$transaction([
            db.user.update({
                where: { id: transaction.userId },
                data: { prxBalance: newBalance },
            }),
            db.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" },
            }),
        ]);

        console.log(`[NP-WEBHOOK] refunded tx ${transaction.id}: -${transaction.amountPrx} PRX`);
        return NextResponse.json({ ok: true, refunded: transaction.amountPrx });
    }

    // ── partially_paid — log but don't credit ────────────
    if (paymentStatus === "partially_paid") {
        console.warn(`[NP-WEBHOOK] Partial payment for tx ${transaction.id}: expected ${body.price_amount}, got ${body.actually_paid}`);
        return NextResponse.json({ ok: true, message: "Partial payment noted" });
    }

    // ── waiting / confirming / sending — informational ───
    console.log(`[NP-WEBHOOK] Status update: ${paymentStatus} for tx ${transaction.id}`);
    return NextResponse.json({ ok: true, message: `Status: ${paymentStatus}` });
}
