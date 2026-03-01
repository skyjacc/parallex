import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const [totalUsers, totalOrders, totalProducts, revenue, recentOrders] = await Promise.all([
            db.user.count(),
            db.order.count(),
            db.product.count(),
            db.order.aggregate({ _sum: { costPrx: true } }),
            db.order.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } },
            }),
        ]);

        return NextResponse.json({
            ok: true,
            stats: {
                totalUsers,
                totalOrders,
                totalProducts,
                totalRevenue: revenue._sum.costPrx || 0,
                recentOrders: recentOrders.map((o) => ({
                    id: o.id,
                    userName: o.user.name,
                    userEmail: o.user.email,
                    productName: o.product.name,
                    costPrx: o.costPrx,
                    createdAt: o.createdAt.toISOString(),
                })),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/stats error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch stats" }, { status: 500 });
    }
}
