import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categorySlug = searchParams.get("category");

        const where: any = {};
        if (categorySlug) {
            const cat = await db.category.findUnique({ where: { slug: categorySlug } });
            if (cat) where.categoryId = cat.id;
        }

        const [products, categories] = await Promise.all([
            db.product.findMany({
                where,
                include: {
                    category: { select: { name: true, slug: true } },
                    _count: { select: { stocks: { where: { isSold: false } }, orders: true, reviews: true } },
                    reviews: { select: { rating: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
        ]);

        return NextResponse.json({
            ok: true,
            products: products.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                imageUrl: p.imageUrl,
                pricePrx: p.pricePrx,
                available: p._count.stocks,
                totalSold: p._count.orders,
                reviewCount: p._count.reviews,
                avgRating: p.reviews.length > 0 ? +(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1) : null,
                category: p.category?.name || null,
                categorySlug: p.category?.slug || null,
                cheatType: p.cheatType,
                detectionStatus: p.detectionStatus,
                osSupport: p.osSupport,
                cpuSupport: p.cpuSupport,
                featured: p.featured,
                createdAt: p.createdAt.toISOString(),
            })),
            categories: categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                productCount: c._count.products,
            })),
        });
    } catch (error) {
        console.error("GET /api/products error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch products" }, { status: 500 });
    }
}
