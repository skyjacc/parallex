import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: ticketId } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
        return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";

    const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (!isAdmin && ticket.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (ticket.status === "CLOSED") return NextResponse.json({ error: "Ticket is closed" }, { status: 400 });

    const message = await db.message.create({
        data: {
            ticketId,
            senderId: userId,
            senderRole: isAdmin ? "ADMIN" : "USER",
            content: content.trim(),
        },
    });

    await db.ticket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } });

    return NextResponse.json({ ok: true, messageId: message.id }, { status: 201 });
}
