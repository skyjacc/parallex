import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const txId = searchParams.get("txId");

        if (!txId) {
            return NextResponse.json({ error: "Missing txId" }, { status: 400 });
        }

        const transaction = await db.transaction.findUnique({
            where: { id: txId },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Only allow the user who created it (or admin)
        if (transaction.userId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let failureReason = null;
        let lastFourDigits = null;

        // If transaction is failed, and it's from MoneyMotion, try to fetch details
        if (transaction.status === "FAILED" && transaction.moneymotionId) {
            const apiKey = process.env.MONEYMOTION_API_KEY;

            if (apiKey && apiKey !== "your-moneymotion-api-key") {
                try {
                    // Fetch checkout session info
                    const sessionRes = await fetch(`https://api.moneymotion.io/checkoutSessions.getCompletedOrPendingCheckoutSessionInfo?json.checkoutId=${transaction.moneymotionId}`, {
                        headers: {
                            "x-api-key": apiKey,
                            "x-currency": "usd"
                        }
                    });

                    if (sessionRes.ok) {
                        const sessData = await sessionRes.json();
                        const checkoutInfo = sessData?.result?.data?.json;

                        if (checkoutInfo) {
                            // If there's a specific decline reason mapped here, we could grab it.
                            failureReason = checkoutInfo.status === "failed" ? "Payment declined by issuing bank" : null;

                            // Fetch billing information if we have a customerEmail or id
                            if (checkoutInfo.customerEmail) {
                                const billingRes = await fetch(`https://api.moneymotion.io/customers.getBillingInformation?json.id=${checkoutInfo.customerEmail}`, {
                                    headers: {
                                        "x-api-key": apiKey,
                                        "x-currency": "usd"
                                    }
                                });

                                if (billingRes.ok) {
                                    const billData = await billingRes.json();
                                    const paymentInfo = billData?.result?.data?.json?.paymentInformation;
                                    if (paymentInfo && paymentInfo.lastFourDigits) {
                                        lastFourDigits = paymentInfo.lastFourDigits;
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error("[TOPUP STATUS] Error fetching MoneyMotion details:", err);
                }
            }
        }

        return NextResponse.json({
            ok: true,
            status: transaction.status, // "PENDING", "COMPLETED", "FAILED"
            amountPrx: transaction.amountPrx,
            failureReason: failureReason || (transaction.status === "FAILED" ? "Payment failed or was cancelled." : null),
            lastFourDigits,
            failedAttempts: transaction.failedAttempts,
        });

    } catch (error) {
        console.error("[TOPUP STATUS] Internal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
