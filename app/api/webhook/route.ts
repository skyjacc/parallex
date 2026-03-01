import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

/**
 * MoneyMotion Webhook Handler (per docs.moneymotion.io)
 *
 * Events:
 *   checkout_session:new       — informational
 *   checkout_session:complete   — credit PRX
 *   checkout_session:expired    — mark FAILED
 *   checkout_session:refunded   — deduct PRX
 *   checkout_session:disputed   — deduct PRX
 *
 * Signature: HMAC-SHA512, base64-encoded
 */

function verifySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
    const computed = crypto.createHmac("sha512", secret).update(rawBody).digest("base64");
    try {
        return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();

        // ── Verify HMAC-SHA512 base64 signature (per MM docs) ────
        const webhookSecret = process.env.MONEYMOTION_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("[WEBHOOK] MONEYMOTION_WEBHOOK_SECRET not configured");
            return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
        }

        const signature = req.headers.get("x-moneymotion-signature")
            || req.headers.get("x-webhook-signature")
            || req.headers.get("x-signature")
            || req.headers.get("signature");

        if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
            console.error("[WEBHOOK] Signature mismatch or missing");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // ── Parse payload ───────────────────────────────────────
        const payload = JSON.parse(rawBody);

        const fullEvent: string = payload.event || "";
        const txId: string = payload.checkoutSession?.id || "";

        if (!fullEvent) {
            console.error("[WEBHOOK] Missing event:", JSON.stringify(payload).slice(0, 200));
            return NextResponse.json({ error: "Missing event" }, { status: 400 });
        }
        if (!txId) {
            console.error("[WEBHOOK] Missing checkoutSession.id:", JSON.stringify(payload).slice(0, 200));
            return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
        }

        console.log(`[WEBHOOK] ${fullEvent} | session=${txId}`);

        // ── Find our transaction by moneymotionId ────────────────
        const transaction = await db.transaction.findUnique({
            where: { moneymotionId: txId },
        });

        // ── checkout_session:new — may arrive before we create tx ─
        if (fullEvent === "checkout_session:new") {
            console.log(`[WEBHOOK] new session ${txId} — acknowledged`);
            return NextResponse.json({ ok: true });
        }

        if (!transaction) {
            console.error(`[WEBHOOK] Transaction not found for session ${txId}`);
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // ── checkout_session:complete — credit PRX ───────────────
        if (fullEvent === "checkout_session:complete") {
            if (transaction.status === "COMPLETED") {
                return NextResponse.json({ ok: true, message: "Already processed" });
            }

            const cardLast4 = payload.customer?.paymentMethodInfo?.lastFourDigits || null;
            const cardBrand = payload.customer?.paymentMethodInfo?.cardBrand || null;

            await db.$transaction([
                db.user.update({
                    where: { id: transaction.userId },
                    data: { prxBalance: { increment: transaction.amountPrx } },
                }),
                db.transaction.update({
                    where: { id: transaction.id },
                    data: { status: "COMPLETED", cardLast4, cardBrand },
                }),
            ]);

            console.log(`[WEBHOOK] +${transaction.amountPrx} PRX -> user ${transaction.userId} (${cardBrand} ****${cardLast4})`);
            return NextResponse.json({ ok: true, credited: transaction.amountPrx });
        }

        // ── checkout_session:expired — mark FAILED ───────────────
        if (fullEvent === "checkout_session:expired") {
            if (transaction.status !== "PENDING") {
                return NextResponse.json({ ok: true, message: "Already processed" });
            }

            await db.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" },
            });

            console.log(`[WEBHOOK] expired ${txId} -> FAILED`);
            return NextResponse.json({ ok: true });
        }

        // ── checkout_session:refunded / disputed — deduct PRX ────
        if (fullEvent === "checkout_session:refunded" || fullEvent === "checkout_session:disputed") {
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

            console.log(`[WEBHOOK] ${fullEvent} ${txId}: -${transaction.amountPrx} PRX (balance: ${newBalance})`);
            return NextResponse.json({ ok: true, refunded: transaction.amountPrx });
        }

        // ── Unknown event ───────────────────────────────────────
        console.warn(`[WEBHOOK] Unknown event: ${fullEvent}`);
        return NextResponse.json({ ok: true, message: "Unknown event" });
    } catch (error) {
        console.error("[WEBHOOK] Error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
