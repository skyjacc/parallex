import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const user = await db.user.findUnique({ where: { id: userId }, select: { referralCode: true } });

    if (!user?.referralCode) {
        const code = crypto.randomBytes(4).toString("hex").toUpperCase();
        await db.user.update({ where: { id: userId }, data: { referralCode: code } });
        user!.referralCode = code;
    }

    const referrals = await db.referral.findMany({
        where: { referrerId: userId },
        include: { referred: { select: { name: true, createdAt: true } } },
        orderBy: { createdAt: "desc" },
    });

    const totalBonus = referrals.reduce((s, r) => s + r.bonusPrx, 0);

    return NextResponse.json({
        ok: true,
        referralCode: user!.referralCode,
        referralLink: `${process.env.NEXTAUTH_URL || "https://shop.parallax.cards"}/auth/signup?ref=${user!.referralCode}`,
        totalReferrals: referrals.length,
        totalBonus,
        referrals: referrals.map((r) => ({
            userName: r.referred.name,
            bonus: r.bonusPrx,
            date: r.createdAt.toISOString(),
        })),
    });
}
