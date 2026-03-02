import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const [orders, customers, reviews] = await Promise.all([
            db.order.count(),
            db.user.count(),
            db.review.count(),
        ]);

        return NextResponse.json({ ok: true, orders, customers, reviews });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
