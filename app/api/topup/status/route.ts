import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const pollKey = `poll:${(session.user as any).id}`;
        if (!rateLimit(pollKey, 60 * 1000, 30)) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { searchParams } = new URL(req.url);
        const txId = searchParams.get("txId");

        if (!txId) {
            return NextResponse.json({ error: "Missing txId" }, { status: 400 });
        }

        const transaction = await db.transaction.findUnique({
            where: { id: txId },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        if (transaction.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const elapsed = Date.now() - new Date(transaction.createdAt).getTime();
        const isExpired = transaction.status === "PENDING" && elapsed > 30 * 60 * 1000;

        return NextResponse.json({
            ok: true,
            status: isExpired ? "EXPIRED" : transaction.status,
            amountPrx: transaction.amountPrx,
            cardLast4: transaction.cardLast4,
            cardBrand: transaction.cardBrand,
            createdAt: transaction.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("[TOPUP STATUS] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
