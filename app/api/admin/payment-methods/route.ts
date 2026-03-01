import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/admin/payment-methods — toggle enabled/disabled
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id, enabled } = await req.json();

        if (!id || typeof enabled !== "boolean") {
            return NextResponse.json({ ok: false, error: "id and enabled are required" }, { status: 400 });
        }

        const method = await db.paymentMethod.update({
            where: { id },
            data: { enabled },
        });

        return NextResponse.json({ ok: true, method });
    } catch (error) {
        console.error("PATCH /api/admin/payment-methods error:", error);
        return NextResponse.json({ ok: false, error: "Failed to update" }, { status: 500 });
    }
}
