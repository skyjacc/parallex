import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

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

    let ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (ip.includes(",")) ip = ip.split(",")[0].trim();

    // Limits top-up attempts to 5 per minute per IP
    if (!rateLimit(ip, 60 * 1000, 5)) {
        return NextResponse.json({ ok: false, error: "Too many top-up attempts. Try again later." }, { status: 429 });
    }

    const isAdmin = (session.user as any)?.role === "ADMIN";

    try {
        const { prxAmount, paymentMethodId } = await req.json();

        if (!prxAmount || typeof prxAmount !== "number" || isNaN(prxAmount) || !Number.isFinite(prxAmount) || prxAmount < 50) {
            return NextResponse.json({ ok: false, error: "Minimum top-up is 50 PRX and must be a valid number" }, { status: 400 });
        }

        if (prxAmount > 1000000) {
            return NextResponse.json({ ok: false, error: "Maximum top-up is 1,000,000 PRX" }, { status: 400 });
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

        const moneymotionId = `mm_${Date.now()}_${crypto.randomUUID()}`;

        // ── Gateway-specific logic ──────────────────────────────
        const gatewayHandlers: Record<string, () => Promise<{ redirectUrl?: string; checkoutSessionId?: string; error?: string }>> = {
            moneymotion: async () => {
                const apiKey = process.env.MONEYMOTION_API_KEY;
                if (!apiKey || apiKey === "your-moneymotion-api-key") {
                    console.error(`[TOPUP] MoneyMotion API key not configured. Set MONEYMOTION_API_KEY in .env`);
                    return { error: "not_configured" };
                }

                try {
                    const mmRes = await fetch("https://api.moneymotion.io/checkoutSessions.createCheckoutSession", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            json: {
                                description: `PRX Top-up - ${prxAmount} PRX`,
                                urls: {
                                    success: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/topup?success=true`,
                                    cancel: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/topup?cancelled=true`,
                                    failure: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/topup?cancelled=true`,
                                },
                                userInfo: {
                                    email: user.email,
                                },
                                lineItems: [
                                    {
                                        name: "PRX Top-up",
                                        description: `${prxAmount} PRX (+${bonusPrx} bonus)`,
                                        pricePerItemInCents: Math.round(usdAmount * 100),
                                        quantity: 1,
                                    },
                                ],
                            },
                        }),
                    });

                    if (mmRes.ok) {
                        const mmData = await mmRes.json();
                        const checkoutSessionId = mmData?.result?.data?.json?.checkoutSessionId;

                        if (checkoutSessionId) {
                            return { checkoutSessionId, redirectUrl: `https://moneymotion.io/checkout/${checkoutSessionId}` };
                        }
                    }

                    const errBody = await mmRes.text().catch(() => "");
                    console.error(`[TOPUP] MoneyMotion API returned ${mmRes.status}: ${errBody}`);
                    return { error: "gateway_error" };
                } catch (e) {
                    console.error("[TOPUP] MoneyMotion API network error:", e);
                    return { error: "gateway_unreachable" };
                }
            },

            stripe: async () => {
                console.error("[TOPUP] Stripe integration not yet configured. Set up Stripe API keys.");
                return { error: "not_configured" };
            },

            paypal: async () => {
                console.error("[TOPUP] PayPal integration not yet configured.");
                return { error: "not_configured" };
            },

            crypto: async () => {
                console.error("[TOPUP] Crypto integration not yet configured.");
                return { error: "not_configured" };
            },
        };

        const handler = gatewayHandlers[method.code];
        if (!handler) {
            console.error(`[TOPUP] No handler for payment method code: ${method.code}`);
            return NextResponse.json({
                ok: false,
                error: "This payment method is temporarily unavailable. Please try another.",
                ...(isAdmin ? { _admin: `No gateway handler for code "${method.code}"` } : {}),
            }, { status: 503 });
        }

        const result = await handler();

        if (result.error) {
            // User gets a clean error, admin gets details
            const userMessage = "This payment method is temporarily unavailable. Please try another method or contact support.";
            const adminDetails: Record<string, string> = {
                not_configured: `Gateway "${method.code}" is not configured. Set the API key in .env and restart the server.`,
                gateway_error: `Gateway "${method.code}" returned an error. Check server logs for details.`,
                gateway_unreachable: `Cannot reach "${method.code}" API. Check network or API status.`,
            };

            return NextResponse.json({
                ok: false,
                error: userMessage,
                ...(isAdmin ? { _admin: adminDetails[result.error] || result.error } : {}),
            }, { status: 503 });
        }

        // ── Success — create transaction ────────────────────────
        const finalTxId = result.checkoutSessionId || moneymotionId;

        await db.transaction.create({
            data: {
                userId: user.id,
                amountPrx: totalPrx,
                moneymotionId: finalTxId,
                status: "PENDING",
                type: "DEPOSIT",
            },
        });

        if (result.redirectUrl) {
            return NextResponse.json({
                ok: true,
                redirectUrl: result.redirectUrl,
                session: { id: moneymotionId, totalPrx, usdAmount, bonusPrx },
            });
        }

        // Should not reach here if handler returned successfully without redirect
        return NextResponse.json({
            ok: false,
            error: "Payment gateway did not return a checkout URL. Please try again.",
            ...(isAdmin ? { _admin: "Handler returned success but no redirectUrl" } : {}),
        }, { status: 502 });
    } catch (error) {
        console.error("[TOPUP] Unexpected error:", error);
        return NextResponse.json({ ok: false, error: "Something went wrong. Please try again later." }, { status: 500 });
    }
}
