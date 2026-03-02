import { NextResponse } from "next/server";

// Popular currencies shown first
const POPULAR = ["btc", "eth", "usdt", "ltc", "xmr", "trx", "sol", "doge", "bnb", "matic", "usdc", "ada", "dot"];

// Cache currencies for 10 minutes
let cachedCurrencies: string[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

export async function GET() {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ ok: false, error: "Crypto payments not configured" }, { status: 503 });
    }

    const now = Date.now();
    if (cachedCurrencies && now - cacheTime < CACHE_TTL) {
        return NextResponse.json({ ok: true, currencies: cachedCurrencies });
    }

    try {
        const res = await fetch("https://api.nowpayments.io/v1/currencies", {
            headers: { "x-api-key": apiKey },
        });

        if (!res.ok) {
            console.error(`[CRYPTO-CURRENCIES] NOWPayments returned ${res.status}`);
            return NextResponse.json({ ok: false, error: "Failed to fetch currencies" }, { status: 502 });
        }

        const data = await res.json();
        const all: string[] = data.currencies || [];

        // Sort: popular first (in order), then rest alphabetically
        const popularSet = new Set(POPULAR);
        const top = POPULAR.filter((c) => all.includes(c));
        const rest = all.filter((c) => !popularSet.has(c)).sort();

        cachedCurrencies = [...top, ...rest];
        cacheTime = now;

        return NextResponse.json({ ok: true, currencies: cachedCurrencies });
    } catch (e) {
        console.error("[CRYPTO-CURRENCIES] Network error:", e);
        return NextResponse.json({ ok: false, error: "Network error" }, { status: 502 });
    }
}
