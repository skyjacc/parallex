import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const FRAUD_CARD_THRESHOLD = 3;

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ ok: false, error: "You must be signed in to purchase" }, { status: 401 });
        }

        let ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        if (ip.includes(",")) ip = ip.split(",")[0].trim();
        const key = `buy:${(session.user as any).id || ip}`;
        if (!rateLimit(key, 60 * 1000, 10)) {
            return NextResponse.json({ ok: false, error: "Too many purchase attempts. Please wait." }, { status: 429 });
        }

        const { id: productId } = await params;

        const result = await db.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { email: session.user!.email! } });
            if (!user) throw new Error("User not found");

            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) throw new Error("Product not found");

            if (user.prxBalance < product.pricePrx) {
                throw new Error(`Insufficient balance. Need ${product.pricePrx} PRX, have ${user.prxBalance} PRX`);
            }

            const stock = await tx.stock.findFirst({ where: { productId, isSold: false } });
            if (!stock) throw new Error("Out of stock. No keys available for this product.");

            // Check fraud: count unique cards used for deposits
            const uniqueCards = await tx.transaction.findMany({
                where: { userId: user.id, status: "COMPLETED", cardLast4: { not: null } },
                select: { cardLast4: true, cardBrand: true },
                distinct: ["cardLast4"],
            });
            const isFraudRisk = user.flagged || uniqueCards.length >= FRAUD_CARD_THRESHOLD;

            await tx.user.update({
                where: { id: user.id },
                data: { prxBalance: { decrement: product.pricePrx } },
            });

            await tx.stock.update({
                where: { id: stock.id },
                data: { isSold: true },
            });

            const order = await tx.order.create({
                data: {
                    userId: user.id,
                    productId,
                    stockId: stock.id,
                    costPrx: product.pricePrx,
                    status: isFraudRisk ? "REVIEW" : "COMPLETED",
                },
            });

            return {
                orderId: order.id,
                productName: product.name,
                key: isFraudRisk ? null : stock.content,
                costPrx: product.pricePrx,
                newBalance: user.prxBalance - product.pricePrx,
                status: isFraudRisk ? "REVIEW" as const : "COMPLETED" as const,
            };
        });

        return NextResponse.json({ ok: true, ...result });
    } catch (error: any) {
        const message = error?.message || "Purchase failed";
        const status = message.includes("Insufficient") || message.includes("Out of stock") ? 400 : 500;
        return NextResponse.json({ ok: false, error: message }, { status });
    }
}
