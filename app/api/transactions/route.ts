import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    try {
        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
        }

        const transactions = await db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            ok: true,
            transactions: transactions.map((t) => ({
                id: t.id,
                amountPrx: t.amountPrx,
                status: t.status,
                type: t.type,
                createdAt: t.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("GET /api/transactions error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch transactions" }, { status: 500 });
    }
}
