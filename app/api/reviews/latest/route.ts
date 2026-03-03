import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    const reviews = await db.review.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
            user: { select: { name: true } },
            product: { select: { id: true, name: true } },
        },
    });

    return NextResponse.json({
        ok: true,
        reviews: reviews.map((r) => ({
            userName: r.user.name,
            productName: r.product.name,
            productId: r.product.id,
            rating: r.rating,
            comment: r.comment,
        })),
    });
}
