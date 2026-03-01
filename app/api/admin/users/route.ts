import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const take = Math.min(Number(searchParams.get("limit")) || 50, 200);
        const skip = Number(searchParams.get("offset")) || 0;

        const [users, total] = await Promise.all([
            db.user.findMany({
                take,
                skip,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    prxBalance: true,
                    createdAt: true,
                    _count: { select: { orders: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            db.user.count(),
        ]);

        return NextResponse.json({
            ok: true,
            total,
            users: users.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                prxBalance: u.prxBalance,
                ordersCount: u._count.orders,
                createdAt: u.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("GET /api/admin/users error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch users" }, { status: 500 });
    }
}
