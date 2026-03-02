import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const isAdmin = (session.user as any).role === "ADMIN";
    const userId = (session.user as any).id;

    const ticket = await db.ticket.findUnique({
        where: { id },
        include: {
            user: { select: { name: true, email: true } },
            messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { name: true } } } },
        },
    });

    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isAdmin && ticket.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({
        ok: true,
        ticket: {
            id: ticket.id, subject: ticket.subject, status: ticket.status,
            userName: ticket.user.name, userEmail: ticket.user.email,
            createdAt: ticket.createdAt.toISOString(),
        },
        messages: ticket.messages.map((m) => ({
            id: m.id, content: m.content, senderName: m.sender.name,
            senderRole: m.senderRole, createdAt: m.createdAt.toISOString(),
        })),
    });
}

export async function PATCH(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    await db.ticket.update({ where: { id }, data: { status: "CLOSED" } });

    return NextResponse.json({ ok: true });
}
