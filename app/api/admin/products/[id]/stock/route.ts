import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id: productId } = await params;
        const stocks = await db.stock.findMany({
            where: { productId },
            select: { id: true, content: true, isSold: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ ok: true, stocks });
    } catch (error) {
        console.error("GET /api/admin/products/[id]/stock error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch stock" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id: productId } = await params;
        const { keys } = await req.json();

        if (!keys?.length) {
            return NextResponse.json({ ok: false, error: "At least one key is required" }, { status: 400 });
        }

        const product = await db.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
        }

        const created = await db.stock.createMany({
            data: keys
                .filter((k: string) => k.trim())
                .map((k: string) => ({ content: k.trim(), productId })),
        });

        return NextResponse.json({ ok: true, added: created.count });
    } catch (error) {
        console.error("POST /api/admin/products/[id]/stock error:", error);
        return NextResponse.json({ ok: false, error: "Failed to add stock" }, { status: 500 });
    }
}
