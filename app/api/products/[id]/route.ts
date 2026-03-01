import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const product = await db.product.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        stocks: { where: { isSold: false } },
                        orders: true,
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({
            ok: true,
            product: {
                id: product.id,
                name: product.name,
                description: product.description,
                imageUrl: product.imageUrl,
                pricePrx: product.pricePrx,
                available: product._count.stocks,
                totalSold: product._count.orders,
                createdAt: product.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error("GET /api/products/[id] error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch product" }, { status: 500 });
    }
}
