import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, coupons });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { code, discountPercent, discountFixed, maxUses, expiresAt } = await req.json();

    if (!code?.trim()) return NextResponse.json({ error: "Code is required" }, { status: 400 });

    const coupon = await db.coupon.create({
        data: {
            code: code.trim().toUpperCase(),
            discountPercent: discountPercent || null,
            discountFixed: discountFixed || null,
            maxUses: maxUses || 0,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
    });

    return NextResponse.json({ ok: true, coupon }, { status: 201 });
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await req.json();
    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
