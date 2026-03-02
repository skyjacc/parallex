import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    if (!rateLimit(`pw:${userId}`, 60 * 1000, 5)) {
        return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Both fields required" }, { status: 400 });
    }
    if (newPassword.length < 6 || newPassword.length > 128) {
        return NextResponse.json({ error: "Password must be 6-128 characters" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const hashed = await hash(newPassword, 12);
    await db.user.update({ where: { id: userId }, data: { password: hashed } });

    return NextResponse.json({ ok: true });
}
