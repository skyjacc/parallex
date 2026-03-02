import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = (session.user as any).role === "ADMIN";
    const userId = (session.user as any).id;

    const tickets = await db.ticket.findMany({
        where: isAdmin ? {} : { userId },
        orderBy: { updatedAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
            _count: { select: { messages: true } },
        },
    });

    return NextResponse.json({
        ok: true,
        tickets: tickets.map((t) => ({
            id: t.id, subject: t.subject, status: t.status,
            userName: t.user.name, userEmail: t.user.email,
            messageCount: t._count.messages,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
        })),
    });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, message } = await req.json();
    if (!subject?.trim() || !message?.trim()) {
        return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const ticket = await db.ticket.create({
        data: {
            userId,
            subject: subject.trim(),
            messages: {
                create: {
                    senderId: userId,
                    senderRole: "USER",
                    content: message.trim(),
                },
            },
        },
    });

    return NextResponse.json({ ok: true, ticketId: ticket.id }, { status: 201 });
}
