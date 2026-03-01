import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const pollKey = `poll:${(session.user as any).id}`;
        if (!rateLimit(pollKey, 60 * 1000, 30)) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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

        if (transaction.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let failureReason = null;
        let lastFourDigits = null;

        if (transaction.status === "FAILED" && transaction.moneymotionId) {
            const apiKey = process.env.MONEYMOTION_API_KEY;

            if (apiKey && apiKey !== "your-moneymotion-api-key") {
                try {
                    const sessionRes = await fetch(`https://api.moneymotion.io/checkoutSessions.getCompletedOrPendingCheckoutSessionInfo?json.checkoutId=${transaction.moneymotionId}`, {
                        headers: { "x-api-key": apiKey, "x-currency": "usd" }
                    });

                    if (sessionRes.ok) {
                        const sessData = await sessionRes.json();
                        const checkoutInfo = sessData?.result?.data?.json;

                        if (checkoutInfo) {
                            failureReason = checkoutInfo.status === "failed" ? "Payment declined by issuing bank" : null;

                            if (checkoutInfo.customerEmail) {
                                const billingRes = await fetch(`https://api.moneymotion.io/customers.getBillingInformation?json.id=${checkoutInfo.customerEmail}`, {
                                    headers: { "x-api-key": apiKey, "x-currency": "usd" }
                                });

                                if (billingRes.ok) {
                                    const billData = await billingRes.json();
                                    const paymentInfo = billData?.result?.data?.json?.paymentInformation;
                                    if (paymentInfo?.lastFourDigits) {
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

        const elapsed = Date.now() - new Date(transaction.createdAt).getTime();
        const isExpired = transaction.status === "PENDING" && elapsed > 30 * 60 * 1000;

        return NextResponse.json({
            ok: true,
            status: isExpired ? "EXPIRED" : transaction.status,
            amountPrx: transaction.amountPrx,
            failureReason: failureReason || (transaction.status === "FAILED" ? "Payment failed or was cancelled." : null),
            lastFourDigits,
            failedAttempts: transaction.failedAttempts,
            createdAt: transaction.createdAt.toISOString(),
        });

    } catch (error) {
        console.error("[TOPUP STATUS] Internal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
