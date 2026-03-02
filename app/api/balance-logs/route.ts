import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;

    const logs = await db.balanceLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    return NextResponse.json({
        ok: true,
        logs: logs.map((l) => ({
            id: l.id, type: l.type, amount: l.amount,
            description: l.description,
            balanceBefore: l.balanceBefore, balanceAfter: l.balanceAfter,
            createdAt: l.createdAt.toISOString(),
        })),
    });
}
