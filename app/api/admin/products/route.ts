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
        const products = await db.product.findMany({
            include: {
                stocks: { select: { id: true, content: true, isSold: true } },
                _count: { select: { orders: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            ok: true,
            products: products.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                pricePrx: p.pricePrx,
                stock: p.stocks,
                totalSold: p._count.orders,
                createdAt: p.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("GET /api/admin/products error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const { name, description, pricePrx, keys } = await req.json();

        if (!name || !description || !pricePrx) {
            return NextResponse.json({ ok: false, error: "Name, description and price are required" }, { status: 400 });
        }

        const product = await db.product.create({
            data: {
                name,
                description,
                pricePrx: Number(pricePrx),
                stocks: keys?.length
                    ? {
                          create: keys
                              .filter((k: string) => k.trim())
                              .map((k: string) => ({ content: k.trim() })),
                      }
                    : undefined,
            },
            include: { _count: { select: { stocks: true } } },
        });

        return NextResponse.json({ ok: true, product: { id: product.id, name: product.name } });
    } catch (error) {
        console.error("POST /api/admin/products error:", error);
        return NextResponse.json({ ok: false, error: "Failed to create product" }, { status: 500 });
    }
}
