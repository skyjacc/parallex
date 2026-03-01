import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const products = await db.product.findMany({
            include: {
                _count: {
                    select: {
                        stocks: { where: { isSold: false } },
                        orders: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const result = products.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            imageUrl: p.imageUrl,
            pricePrx: p.pricePrx,
            available: p._count.stocks,
            totalSold: p._count.orders,
            createdAt: p.createdAt.toISOString(),
        }));

        return NextResponse.json({ ok: true, products: result });
    } catch (error) {
        console.error("GET /api/products error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch products" }, { status: 500 });
    }
}
