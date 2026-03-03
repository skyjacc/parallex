import { db } from "./db";

export async function logBalance(
    userId: string,
    type: string,
    amount: number,
    description: string,
) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { prxBalance: true } });
    if (!user) return;

    const balanceAfter = user.prxBalance;
    const balanceBefore = balanceAfter - amount;

    await db.balanceLog.create({
        data: { userId, type, amount, description, balanceBefore, balanceAfter },
    });
}
