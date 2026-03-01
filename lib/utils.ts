import { twMerge } from "tailwind-merge";

/** Объединение Tailwind классов с разрешением конфликтов */
export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(inputs.filter(Boolean).join(" "));
}

/** Курс PRX: 100 PRX = 1 USD */
export const PRX_PER_USD = Number(process.env.PRX_PER_USD) || 100;

/** Форматирование PRX-суммы */
export function formatPrx(amount: number): string {
    return `${amount.toFixed(2)} PRX`;
}

/** Конвертация USD (в центах) → PRX */
export function usdCentsToPrx(cents: number): number {
    return (cents / 100) * PRX_PER_USD;
}

/** Конвертация PRX → USD (в центах) */
export function prxToUsdCents(prx: number): number {
    return Math.round((prx / PRX_PER_USD) * 100);
}
