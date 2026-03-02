import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const { orderId, action } = await req.json();

        if (!orderId || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ ok: false, error: "orderId and action (approve|reject) required" }, { status: 400 });
        }

        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { stock: true },
        });

        if (!order) {
            return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
        }

        if (order.status !== "REVIEW") {
            return NextResponse.json({ ok: false, error: "Order is not in review" }, { status: 400 });
        }

        if (action === "approve") {
            await db.order.update({
                where: { id: orderId },
                data: { status: "COMPLETED" },
            });
            return NextResponse.json({ ok: true, action: "approved" });
        }

        // Reject: return PRX, unmark stock
        await db.$transaction([
            db.order.update({
                where: { id: orderId },
                data: { status: "REJECTED" },
            }),
            db.user.update({
                where: { id: order.userId },
                data: { prxBalance: { increment: order.costPrx } },
            }),
            db.stock.update({
                where: { id: order.stockId },
                data: { isSold: false },
            }),
        ]);

        return NextResponse.json({ ok: true, action: "rejected", refunded: order.costPrx });
    } catch (error) {
        console.error("POST /api/admin/orders/review error:", error);
        return NextResponse.json({ ok: false, error: "Failed to process review" }, { status: 500 });
    }
}
