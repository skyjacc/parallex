import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

// POST /api/webhooks/moneymotion — receive payment confirmation
export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-moneymotion-signature");

        // ── Verify HMAC SHA-512 signature ───────────────────────
        const webhookSecret = process.env.MONEYMOTION_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("MONEYMOTION_WEBHOOK_SECRET not configured");
            return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
        }

        const expectedSignature = crypto
            .createHmac("sha512", webhookSecret)
            .update(rawBody)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.error("Webhook signature verification failed");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // ── Parse payload ───────────────────────────────────────
        const payload = JSON.parse(rawBody);
        const { moneymotionId, status } = payload;

        if (!moneymotionId) {
            return NextResponse.json({ error: "Missing moneymotionId" }, { status: 400 });
        }

        // ── Find transaction ────────────────────────────────────
        const transaction = await db.transaction.findUnique({
            where: { moneymotionId },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Already processed — idempotent
        if (transaction.status !== "PENDING") {
            return NextResponse.json({ ok: true, message: "Already processed" });
        }

        if (status === "completed" || status === "success") {
            // ── Atomic: credit user balance + mark transaction complete
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

            console.log(`✅ Webhook: ${transaction.amountPrx} PRX credited to user ${transaction.userId}`);
        } else if (status === "failed" || status === "expired") {
            await db.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" },
            });

            console.log(`❌ Webhook: Transaction ${moneymotionId} failed`);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
