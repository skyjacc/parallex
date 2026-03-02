import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

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

    const uid = (session.user as any).id;
    if (!rateLimit(`ticket:${uid}`, 3600 * 1000, 3)) {
        return NextResponse.json({ error: "Max 3 tickets per hour" }, { status: 429 });
    }

    const { subject, message } = await req.json();
    if (!subject?.trim() || !message?.trim()) {
        return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
    }
    if (subject.trim().length > 200) {
        return NextResponse.json({ error: "Subject too long (max 200)" }, { status: 400 });
    }
    if (message.trim().length > 2000) {
        return NextResponse.json({ error: "Message too long (max 2000)" }, { status: 400 });
    }

    const ticket = await db.ticket.create({
        data: {
            userId: uid,
            subject: subject.trim(),
            messages: {
                create: {
                    senderId: uid,
                    senderRole: "USER",
                    content: message.trim(),
                },
            },
        },
    });

    return NextResponse.json({ ok: true, ticketId: ticket.id }, { status: 201 });
}
