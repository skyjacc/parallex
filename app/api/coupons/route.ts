import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await req.json();
    if (!code?.trim()) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });

    const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

    if (!coupon || !coupon.active) {
        return NextResponse.json({ ok: false, error: "Invalid coupon code" }, { status: 404 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ ok: false, error: "Coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ ok: false, error: "Coupon usage limit reached" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const alreadyUsed = await db.couponUse.findUnique({
        where: { couponId_userId: { couponId: coupon.id, userId } },
    });

    if (alreadyUsed) {
        return NextResponse.json({ ok: false, error: "You already used this coupon" }, { status: 400 });
    }

    return NextResponse.json({
        ok: true,
        coupon: {
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            discountFixed: coupon.discountFixed,
        },
    });
}
