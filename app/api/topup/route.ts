import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const BASE_RATE = 100;

const bonusTiers = [
    { min: 0, max: 499, bonus: 0 },
    { min: 500, max: 999, bonus: 3 },
    { min: 1000, max: 2499, bonus: 5 },
    { min: 2500, max: 4999, bonus: 8 },
    { min: 5000, max: 9999, bonus: 12 },
    { min: 10000, max: Infinity, bonus: 15 },
];

function getBonus(prx: number) {
    return bonusTiers.find((t) => prx >= t.min && prx <= t.max)?.bonus || 0;
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { prxAmount, paymentMethodId } = await req.json();

        if (!prxAmount || prxAmount < 50) {
            return NextResponse.json({ ok: false, error: "Minimum top-up is 50 PRX" }, { status: 400 });
        }

        if (!paymentMethodId) {
            return NextResponse.json({ ok: false, error: "Payment method is required" }, { status: 400 });
        }

        // ── Validate payment method is ENABLED ──────────────────
        const method = await db.paymentMethod.findUnique({ where: { id: paymentMethodId } });

        if (!method) {
            return NextResponse.json({ ok: false, error: "Payment method not found" }, { status: 404 });
        }

        if (!method.enabled) {
            return NextResponse.json({
                ok: false,
                error: `Payment method "${method.name}" is currently disabled by administrator. Please choose another method.`,
            }, { status: 403 });
        }

        // ── Calculate ───────────────────────────────────────────
        const bonusPercent = getBonus(prxAmount);
        const bonusPrx = Math.floor(prxAmount * (bonusPercent / 100));
        const totalPrx = prxAmount + bonusPrx;
        const usdAmount = prxAmount / BASE_RATE;

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
        }

        const moneymotionId = `mm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        await db.transaction.create({
            data: {
                userId: user.id,
                amountPrx: totalPrx,
                moneymotionId,
                status: "PENDING",
                type: "DEPOSIT",
            },
        });

        // ── MoneyMotion integration ─────────────────────────────
        if (method.code === "moneymotion") {
            const apiKey = process.env.MONEYMOTION_API_KEY;

            if (apiKey) {
                try {
                    const mmRes = await fetch("https://api.moneymotion.io/v1/checkout/sessions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            amount: Math.round(usdAmount * 100), // cents
                            currency: "usd",
                            metadata: { moneymotionId, userId: user.id, prxAmount: totalPrx },
                            success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/topup?success=true&session=${moneymotionId}`,
                            cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/topup?cancelled=true`,
                        }),
                    });

                    if (mmRes.ok) {
                        const mmData = await mmRes.json();
                        return NextResponse.json({
                            ok: true,
                            redirectUrl: mmData.url || mmData.checkout_url,
                            session: { id: moneymotionId, totalPrx, usdAmount, bonusPrx },
                        });
                    }
                } catch (e) {
                    console.error("MoneyMotion API error:", e);
                }
            }
        }

        // ── Fallback: return session without redirect ───────────
        return NextResponse.json({
            ok: true,
            session: {
                id: moneymotionId,
                prxAmount,
                bonusPrx,
                totalPrx,
                usdAmount: usdAmount.toFixed(2),
                method: method.code,
            },
        });
    } catch (error) {
        console.error("POST /api/topup error:", error);
        return NextResponse.json({ ok: false, error: "Failed to create payment session" }, { status: 500 });
    }
}
