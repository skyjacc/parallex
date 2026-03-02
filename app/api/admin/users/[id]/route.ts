import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = await params;

        const user = await db.user.findUnique({
            where: { id },
            select: {
                id: true, name: true, email: true, role: true,
                prxBalance: true, flagged: true, createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
        }

        const [transactions, orders] = await Promise.all([
            db.transaction.findMany({
                where: { userId: id },
                orderBy: { createdAt: "asc" },
                select: { id: true, amountPrx: true, status: true, type: true, cardLast4: true, cardBrand: true, createdAt: true },
            }),
            db.order.findMany({
                where: { userId: id },
                orderBy: { createdAt: "asc" },
                include: { product: { select: { name: true } } },
            }),
        ]);

        // Build timeline with running balance
        type TimelineEntry = {
            type: "deposit" | "purchase";
            description: string;
            amount: number;
            balanceBefore: number;
            balanceAfter: number;
            card?: string | null;
            status?: string;
            createdAt: string;
        };

        const events: { time: Date; build: (bal: number) => TimelineEntry }[] = [];

        for (const tx of transactions) {
            if (tx.status === "COMPLETED") {
                const card = tx.cardLast4 ? `${tx.cardBrand || "card"} ****${tx.cardLast4}` : null;
                events.push({
                    time: tx.createdAt,
                    build: (bal) => ({
                        type: "deposit", description: "Deposit",
                        amount: tx.amountPrx, balanceBefore: bal, balanceAfter: bal + tx.amountPrx,
                        card, status: tx.status, createdAt: tx.createdAt.toISOString(),
                    }),
                });
            }
        }

        for (const o of orders) {
            events.push({
                time: o.createdAt,
                build: (bal) => ({
                    type: "purchase", description: o.product.name,
                    amount: -o.costPrx, balanceBefore: bal, balanceAfter: bal - o.costPrx,
                    status: o.status, createdAt: o.createdAt.toISOString(),
                }),
            });
        }

        events.sort((a, b) => a.time.getTime() - b.time.getTime());

        // Start with welcome bonus (100 PRX given at registration)
        const WELCOME_BONUS = 100;
        let runningBalance = WELCOME_BONUS;
        const timeline: TimelineEntry[] = [{
            type: "deposit",
            description: "Welcome Bonus",
            amount: WELCOME_BONUS,
            balanceBefore: 0,
            balanceAfter: WELCOME_BONUS,
            card: null,
            status: "COMPLETED",
            createdAt: user.createdAt.toISOString(),
        }];
        for (const ev of events) {
            const entry = ev.build(runningBalance);
            timeline.push(entry);
            runningBalance = entry.balanceAfter;
        }

        // Unique cards
        const cardMap = new Map<string, { brand: string; last4: string; count: number; totalPrx: number }>();
        for (const tx of transactions) {
            if (tx.cardLast4 && tx.status === "COMPLETED") {
                const key = `${tx.cardBrand || "card"}_${tx.cardLast4}`;
                const existing = cardMap.get(key);
                if (existing) {
                    existing.count++;
                    existing.totalPrx += tx.amountPrx;
                } else {
                    cardMap.set(key, { brand: tx.cardBrand || "card", last4: tx.cardLast4, count: 1, totalPrx: tx.amountPrx });
                }
            }
        }

        return NextResponse.json({
            ok: true,
            user,
            timeline: timeline.reverse(),
            cards: Array.from(cardMap.values()),
            fraudRisk: cardMap.size >= 3,
            totalDeposited: transactions.filter((t) => t.status === "COMPLETED").reduce((s, t) => s + t.amountPrx, 0),
            totalSpent: orders.reduce((s, o) => s + o.costPrx, 0),
        });
    } catch (error) {
        console.error("GET /api/admin/users/[id] error:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch user" }, { status: 500 });
    }
}
