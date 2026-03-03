import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
        where: { id: (session.user as any).id },
        select: { id: true, name: true, email: true, role: true, prxBalance: true, discordId: true, discordTag: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, user });
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { discordTag } = await req.json();

    const data: Record<string, any> = {};
    if (typeof discordTag === "string") data.discordTag = discordTag.trim() || null;

    await db.user.update({ where: { id: (session.user as any).id }, data });
    return NextResponse.json({ ok: true });
}
