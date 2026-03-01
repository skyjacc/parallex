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

        const [orders, total] = await Promise.all([
            db.order.findMany({
                take,
                skip,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true, email: true } },
                    product: { select: { name: true } },
                    stock: { select: { content: true } },
                },
            }),
            db.order.count(),
        ]);

        return NextResponse.json({
            ok: true,
            total,
            orders: orders.map((o) => ({
                id: o.id,
                userName: o.user.name,
                userEmail: o.user.email,
                productName: o.product.name,
                stockContent: o.stock.content,
                costPrx: o.costPrx,
                createdAt: o.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("GET /api/admin/orders error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch orders" }, { status: 500 });
    }
}
