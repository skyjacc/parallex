import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

/**
 * MoneyMotion Webhook Handler
 * Events: complete, disputed, failed, fraud, new, refunded, created, released
 */

// Events that credit the user's balance
const CREDIT_EVENTS = ["complete"];
// Events that mark transaction as failed
const FAIL_EVENTS = ["failed", "fraud"];
// Events that trigger refund (deduct balance back)
const REFUND_EVENTS = ["refunded", "disputed"];
// Events that are informational only (no balance change)
const INFO_EVENTS = ["new", "created", "released"];

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-moneymotion-signature")
            || req.headers.get("x-webhook-signature")
            || req.headers.get("x-signature");

        // ── Verify HMAC SHA-512 signature ───────────────────────
        const webhookSecret = process.env.MONEYMOTION_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("[WEBHOOK] MONEYMOTION_WEBHOOK_SECRET not configured");
            return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
        }

        const expectedSignature = crypto
            .createHmac("sha512", webhookSecret)
            .update(rawBody)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.error("[WEBHOOK] Signature mismatch — possible tampering");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // ── Parse payload ───────────────────────────────────────
        const payload = JSON.parse(rawBody);

        // MoneyMotion can send event in different field names
        const event = payload.event || payload.status || payload.type;
        const txId = payload.moneymotionId || payload.transaction_id || payload.id || payload.metadata?.moneymotionId;

        if (!event) {
            console.error("[WEBHOOK] Missing event type in payload:", JSON.stringify(payload).slice(0, 200));
            return NextResponse.json({ error: "Missing event type" }, { status: 400 });
        }

        if (!txId) {
            console.error("[WEBHOOK] Missing transaction ID in payload:", JSON.stringify(payload).slice(0, 200));
            return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
        }

        console.log(`[WEBHOOK] Event: ${event} | TX: ${txId}`);

        // ── Find transaction ────────────────────────────────────
        const transaction = await db.transaction.findUnique({
            where: { moneymotionId: txId },
        });

        if (!transaction) {
            // INFO events (new/created) might arrive before we create the transaction
            if (INFO_EVENTS.includes(event)) {
                console.log(`[WEBHOOK] Info event "${event}" for unknown TX ${txId} — ignored`);
                return NextResponse.json({ ok: true, message: "Acknowledged" });
            }
            console.error(`[WEBHOOK] Transaction not found: ${txId}`);
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // ── Handle CREDIT events (complete) ─────────────────────
        if (CREDIT_EVENTS.includes(event)) {
            if (transaction.status === "COMPLETED") {
                console.log(`[WEBHOOK] TX ${txId} already completed — idempotent skip`);
                return NextResponse.json({ ok: true, message: "Already processed" });
            }

            await db.$transaction([
                db.user.update({
                    where: { id: transaction.userId },
                    data: { prxBalance: { increment: transaction.amountPrx } },
                }),
                db.transaction.update({
                    where: { id: transaction.id },
                    data: { status: "COMPLETED" },
                }),
            ]);

            console.log(`[WEBHOOK] ✅ ${transaction.amountPrx} PRX credited to user ${transaction.userId}`);
            return NextResponse.json({ ok: true, credited: transaction.amountPrx });
        }

        // ── Handle FAIL events (failed, fraud) ──────────────────
        if (FAIL_EVENTS.includes(event)) {
            if (transaction.status !== "PENDING") {
                console.log(`[WEBHOOK] TX ${txId} not pending (${transaction.status}) — skip fail`);
                return NextResponse.json({ ok: true, message: "Already processed" });
            }

            await db.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" },
            });

            console.log(`[WEBHOOK] ❌ TX ${txId} marked as FAILED (event: ${event})`);
            return NextResponse.json({ ok: true });
        }

        // ── Handle REFUND events (refunded, disputed) ───────────
        if (REFUND_EVENTS.includes(event)) {
            if (transaction.status !== "COMPLETED") {
                console.log(`[WEBHOOK] TX ${txId} not completed — cannot refund`);
                return NextResponse.json({ ok: true, message: "Nothing to refund" });
            }

            await db.$transaction([
                db.user.update({
                    where: { id: transaction.userId },
                    data: { prxBalance: { decrement: transaction.amountPrx } },
                }),
                db.transaction.update({
                    where: { id: transaction.id },
                    data: { status: "FAILED" },
                }),
            ]);

            console.log(`[WEBHOOK] 🔄 ${transaction.amountPrx} PRX deducted from user ${transaction.userId} (${event})`);
            return NextResponse.json({ ok: true, refunded: transaction.amountPrx });
        }

        // ── Handle INFO events (new, created, released) ─────────
        if (INFO_EVENTS.includes(event)) {
            console.log(`[WEBHOOK] ℹ️ Info event "${event}" for TX ${txId}`);
            return NextResponse.json({ ok: true, message: "Acknowledged" });
        }

        // ── Unknown event ───────────────────────────────────────
        console.warn(`[WEBHOOK] Unknown event type: ${event}`);
        return NextResponse.json({ ok: true, message: "Unknown event — ignored" });
    } catch (error) {
        console.error("[WEBHOOK] Unhandled error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
