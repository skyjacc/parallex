import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ ok: false, error: "You must be signed in to purchase" }, { status: 401 });
        }

        const { id: productId } = await params;

        // Atomic transaction: check balance → find key → deduct → mark sold → create order
        const result = await db.$transaction(async (tx) => {
            // 1. Get user with current balance
            const user = await tx.user.findUnique({ where: { email: session.user!.email! } });
            if (!user) throw new Error("User not found");

            // 2. Get product
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) throw new Error("Product not found");

            // 3. Check balance
            if (user.prxBalance < product.pricePrx) {
                throw new Error(`Insufficient balance. Need ${product.pricePrx} PRX, have ${user.prxBalance.toFixed(0)} PRX`);
            }

            // 4. Find available stock
            const stock = await tx.stock.findFirst({
                where: { productId, isSold: false },
            });
            if (!stock) throw new Error("Out of stock. No keys available for this product.");

            // 5. Deduct balance
            await tx.user.update({
                where: { id: user.id },
                data: { prxBalance: { decrement: product.pricePrx } },
            });

            // 6. Mark stock as sold
            await tx.stock.update({
                where: { id: stock.id },
                data: { isSold: true },
            });

            // 7. Create order
            const order = await tx.order.create({
                data: {
                    userId: user.id,
                    productId,
                    stockId: stock.id,
                    costPrx: product.pricePrx,
                },
            });

            return {
                orderId: order.id,
                productName: product.name,
                key: stock.content,
                costPrx: product.pricePrx,
                newBalance: user.prxBalance - product.pricePrx,
            };
        });

        return NextResponse.json({ ok: true, ...result });
    } catch (error: any) {
        const message = error?.message || "Purchase failed";
        const status = message.includes("Insufficient") || message.includes("Out of stock") ? 400 : 500;
        return NextResponse.json({ ok: false, error: message }, { status });
    }
}
