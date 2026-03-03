import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const reviews = await db.review.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
            product: { select: { name: true } },
        },
    });

    return NextResponse.json({
        ok: true,
        reviews: reviews.map((r) => ({
            id: r.id, rating: r.rating, comment: r.comment, approved: r.approved,
            userName: r.user.name, userEmail: r.user.email,
            productName: r.product.name,
            createdAt: r.createdAt.toISOString(),
        })),
    });
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, ids, approved } = await req.json();

    if (ids && Array.isArray(ids) && typeof approved === "boolean") {
        await db.review.updateMany({ where: { id: { in: ids } }, data: { approved } });
        return NextResponse.json({ ok: true, count: ids.length });
    }

    if (!id || typeof approved !== "boolean") return NextResponse.json({ error: "id and approved required" }, { status: 400 });

    await db.review.update({ where: { id }, data: { approved } });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await req.json();
    await db.review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
