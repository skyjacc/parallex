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
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers, totalOrders, totalProducts, revenue,
            totalStock, availableStock,
            txCompleted, txPending, txFailed,
            txCompletedSum, txPendingSum, txFailedSum,
            recentOrders, topProductsRaw,
            ordersLast7, reviewCount,
        ] = await Promise.all([
            db.user.count(),
            db.order.count(),
            db.product.count(),
            db.order.aggregate({ _sum: { costPrx: true } }),
            db.stock.count(),
            db.stock.count({ where: { isSold: false } }),
            db.transaction.count({ where: { status: "COMPLETED" } }),
            db.transaction.count({ where: { status: "PENDING" } }),
            db.transaction.count({ where: { status: "FAILED" } }),
            db.transaction.aggregate({ where: { status: "COMPLETED" }, _sum: { amountPrx: true } }),
            db.transaction.aggregate({ where: { status: "PENDING" }, _sum: { amountPrx: true } }),
            db.transaction.aggregate({ where: { status: "FAILED" }, _sum: { amountPrx: true } }),
            db.order.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } },
            }),
            db.product.findMany({
                include: { _count: { select: { orders: true } } },
                orderBy: { orders: { _count: "desc" } },
                take: 5,
            }),
            db.order.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { costPrx: true, createdAt: true },
                orderBy: { createdAt: "asc" },
            }),
            db.order.count({ where: { status: "REVIEW" } }),
        ]);

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dailyMap: Record<string, { orders: number; revenue: number }> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const key = dayNames[d.getDay()];
            dailyMap[key] = { orders: 0, revenue: 0 };
        }
        for (const o of ordersLast7) {
            const key = dayNames[o.createdAt.getDay()];
            if (dailyMap[key]) {
                dailyMap[key].orders++;
                dailyMap[key].revenue += o.costPrx;
            }
        }
        const dailyChart = Object.entries(dailyMap).map(([name, v]) => ({ name, orders: v.orders, revenue: v.revenue }));

        return NextResponse.json({
            ok: true,
            stats: {
                totalUsers, totalOrders, totalProducts,
                totalRevenue: revenue._sum.costPrx || 0,
                totalStock, availableStock, reviewCount,
                transactions: {
                    completed: txCompleted, pending: txPending, failed: txFailed,
                    completedSum: txCompletedSum._sum.amountPrx || 0,
                    pendingSum: txPendingSum._sum.amountPrx || 0,
                    failedSum: txFailedSum._sum.amountPrx || 0,
                },
                dailyChart,
                recentOrders: recentOrders.map((o) => ({
                    id: o.id, userName: o.user.name, userEmail: o.user.email,
                    productName: o.product.name, costPrx: o.costPrx,
                    createdAt: o.createdAt.toISOString(),
                })),
                topProducts: topProductsRaw.map((p) => ({
                    name: p.name, sales: p._count.orders, pricePrx: p.pricePrx,
                })),
            },
        });
    } catch (error) {
        console.error("GET /api/admin/stats error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch stats" }, { status: 500 });
    }
}
