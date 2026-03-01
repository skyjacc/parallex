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

        const orders = await db.order.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                product: { select: { name: true } },
                stock: { select: { content: true } },
            },
        });

        return NextResponse.json({
            ok: true,
            orders: orders.map((o) => ({
                id: o.id,
                productName: o.product.name,
                key: o.stock.content,
                costPrx: o.costPrx,
                createdAt: o.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("GET /api/orders error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch orders" }, { status: 500 });
    }
}
