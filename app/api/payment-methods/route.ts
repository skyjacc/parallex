import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/payment-methods — public, returns all methods (disabled ones marked)
export async function GET() {
    try {
        const methods = await db.paymentMethod.findMany({
            orderBy: { sortOrder: "asc" },
        });

        return NextResponse.json({ ok: true, methods });
    } catch (error) {
        console.error("GET /api/payment-methods error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch payment methods" }, { status: 500 });
    }
}
