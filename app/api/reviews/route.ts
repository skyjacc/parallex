import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const reviews = await db.review.findMany({
        where: { productId, approved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
    });

    return NextResponse.json({
        ok: true,
        reviews: reviews.map((r) => ({
            id: r.id, rating: r.rating, comment: r.comment,
            userName: r.user.name, createdAt: r.createdAt.toISOString(),
        })),
    });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;

    if (!rateLimit(`review:${userId}`, 60 * 1000, 5)) {
        return NextResponse.json({ error: "Too many reviews" }, { status: 429 });
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "productId and rating (1-5) required" }, { status: 400 });
    }

    const MIN_ORDERS_FOR_REVIEW = Number(process.env.MIN_ORDERS_FOR_REVIEW) || 5;

    const completedOrders = await db.order.count({
        where: { userId, status: "COMPLETED" },
    });

    if (completedOrders < MIN_ORDERS_FOR_REVIEW) {
        return NextResponse.json({ error: `You need at least ${MIN_ORDERS_FOR_REVIEW} completed orders to leave a review (you have ${completedOrders})` }, { status: 403 });
    }

    const hasPurchasedThis = await db.order.findFirst({
        where: { userId, productId, status: "COMPLETED" },
    });

    if (!hasPurchasedThis) {
        return NextResponse.json({ error: "You must purchase this product before reviewing" }, { status: 403 });
    }

    try {
        const review = await db.review.create({
            data: {
                userId,
                productId,
                rating,
                comment: (comment || "").slice(0, 500),
            },
        });
        return NextResponse.json({ ok: true, reviewId: review.id, message: "Review submitted! It will appear after admin approval." }, { status: 201 });
    } catch (e: any) {
        if (e?.code === "P2002") {
            return NextResponse.json({ error: "You already reviewed this product" }, { status: 409 });
        }
        throw e;
    }
}
