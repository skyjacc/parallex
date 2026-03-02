"use client";

import { Zap, Lock, LogIn, ArrowRight, Percent, Gift, Shield, Loader2, CreditCard, AlertTriangle, CheckCircle, Copy, Check, Clock, Search as SearchIcon, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { toast } from "sonner";

const BASE_RATE = 100;

const bonusTiers = [
    { min: 0, max: 499, bonus: 0, label: "No bonus" },
    { min: 500, max: 999, bonus: 3, label: "+3%" },
    { min: 1000, max: 2499, bonus: 5, label: "+5%" },
    { min: 2500, max: 4999, bonus: 8, label: "+8%" },
    { min: 5000, max: 9999, bonus: 12, label: "+12%" },
    { min: 10000, max: Infinity, bonus: 15, label: "+15%" },
];

function getBonus(prx: number) {
    return bonusTiers.find((t) => prx >= t.min && prx <= t.max) || bonusTiers[0];
}

const quickAmounts = [100, 500, 1000, 2500, 5000, 10000];

/* ── Crypto metadata: ticker → name + cryptologos.cc thumb name ── */
const cryptoMeta: Record<string, { name: string; thumb: string }> = {
    btc: { name: "Bitcoin", thumb: "bitcoin" },
    eth: { name: "Ethereum", thumb: "ethereum" },
    usdt: { name: "Tether", thumb: "tether" },
    ltc: { name: "Litecoin", thumb: "litecoin" },
    xmr: { name: "Monero", thumb: "monero" },
    trx: { name: "TRON", thumb: "tron" },
    sol: { name: "Solana", thumb: "solana" },
    doge: { name: "Dogecoin", thumb: "dogecoin" },
    bnb: { name: "BNB", thumb: "bnb" },
    matic: { name: "Polygon", thumb: "polygon" },
    usdc: { name: "USD Coin", thumb: "usd-coin" },
    ada: { name: "Cardano", thumb: "cardano" },
    dot: { name: "Polkadot", thumb: "polkadot-new" },
    avax: { name: "Avalanche", thumb: "avalanche" },
    xlm: { name: "Stellar", thumb: "stellar" },
    xrp: { name: "XRP", thumb: "xrp" },
    shib: { name: "Shiba Inu", thumb: "shiba-inu" },
    dai: { name: "Dai", thumb: "multi-collateral-dai" },
    atom: { name: "Cosmos", thumb: "cosmos" },
    algo: { name: "Algorand", thumb: "algorand" },
    near: { name: "NEAR", thumb: "near-protocol" },
    apt: { name: "Aptos", thumb: "aptos" },
    ftm: { name: "Fantom", thumb: "fantom" },
    ton: { name: "Toncoin", thumb: "toncoin" },
    link: { name: "Chainlink", thumb: "chainlink" },
    uni: { name: "Uniswap", thumb: "uniswap" },
    aave: { name: "Aave", thumb: "aave" },
    fil: { name: "Filecoin", thumb: "filecoin" },
    arb: { name: "Arbitrum", thumb: "arbitrum" },
    op: { name: "Optimism", thumb: "optimism-ethereum" },
    pepe: { name: "Pepe", thumb: "pepe" },
};

function CryptoIcon({ code, size = 32 }: { code: string; size?: number }) {
    const meta = cryptoMeta[code];
    if (meta) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={`https://cryptologos.cc/thumbs/${meta.thumb}.png?v=040`}
                alt={meta.name}
                width={size}
                height={size}
                className="rounded-full"
                style={{ width: size, height: size }}
                loading="lazy"
            />
        );
    }
    // Fallback: colored circle with ticker letters
    const hue = code.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill={`hsl(${hue}, 55%, 50%)`} />
            <text x="16" y="21" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="monospace">
                {code.slice(0, 3).toUpperCase()}
            </text>
        </svg>
    );
}

function getCryptoName(code: string): string {
    return cryptoMeta[code]?.name || code.toUpperCase();
}

/* ── Payment method SVG icons by code ────────────────────── */
const methodIcons: Record<string, React.ReactNode> = {
    moneymotion: (
        <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none"><rect width="48" height="32" rx="4" fill="#0071b2" /><path d="M14 10h4l3 6 3-6h4l-5 12h-4l-5-12z" fill="white" /><circle cx="35" cy="16" r="5" fill="white" fillOpacity="0.3" /></svg>
    ),
    stripe: (
        <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none"><rect width="48" height="32" rx="4" fill="#635BFF" /><path d="M22 12c0-.8.7-1.2 1.8-1.2 1.6 0 3.6.5 5.2 1.4V8.4c-1.7-.7-3.5-1-5.2-1C20.5 7.4 18 9.2 18 12.3c0 4.8 6.6 4 6.6 6.1 0 1-.8 1.3-2 1.3-1.7 0-4-.7-5.7-1.7v3.9c1.9.8 3.9 1.2 5.7 1.2 3.5 0 5.9-1.7 5.9-4.9 0-5.2-6.5-4.3-6.5-6.2z" fill="white" /></svg>
    ),
    paypal: (
        <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none"><rect width="48" height="32" rx="4" fill="#003087" /><path d="M20.5 8H26C28.5 8 30 9.5 29.7 12C29.3 15 27 16.5 24.5 16.5H23L22 22H19L20.5 8Z" fill="#009CDE" /><path d="M18.5 10H24C26.5 10 28 11.5 27.7 14C27.3 17 25 18.5 22.5 18.5H21L20 24H17L18.5 10Z" fill="white" /></svg>
    ),
    crypto: (
        <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none"><rect width="48" height="32" rx="4" fill="#F7931A" /><path d="M30 14.5C30.3 12.5 28.8 11.4 26.7 10.7L27.3 8.3L25.8 7.9L25.2 10.2C24.8 10.1 24.4 10 24 9.9L24.6 7.6L23.1 7.2L22.5 9.6C22.2 9.5 21.8 9.4 21.5 9.3L19.5 8.8L19.1 10.4C19.1 10.4 20.2 10.7 20.2 10.7C20.8 10.8 20.9 11.2 20.9 11.5L20.2 14.3C20.3 14.3 20.3 14.3 20.4 14.4L20.2 14.3L19.2 18.1C19.2 18.3 19 18.6 18.5 18.4L17.4 18.1L16.7 19.9L18.6 20.4L19.3 20.6L18.7 23L20.2 23.4L20.8 21C21.2 21.1 21.6 21.2 22 21.3L21.4 23.7L22.9 24.1L23.5 21.7C26 22.2 27.9 22 28.7 19.8C29.4 18 28.7 16.9 27.4 16.2C28.3 16 29 15.4 30 14.5Z" fill="white" /></svg>
    ),
};

interface PaymentMethod {
    id: string;
    code: string;
    name: string;
    description: string;
    enabled: boolean;
}

export default function TopUpPage() {
    return (
        <Suspense>
            <TopUpContent />
        </Suspense>
    );
}

function TopUpContent() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [inputPrx, setInputPrx] = useState("");
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [pollingTxId, setPollingTxId] = useState<string | null>(null);
    const [pollStatus, setPollStatus] = useState<{
        status: string;
        amountPrx?: number;
        cardLast4?: string | null;
        cardBrand?: string | null;
    } | null>(null);
    const [pollElapsed, setPollElapsed] = useState(0);
    const [cryptoPayment, setCryptoPayment] = useState<{
        paymentId: string;
        payAddress: string;
        payAmount: number;
        payCurrency: string;
        payinExtraId: string | null;
        expiresAt: string | null;
        network: string;
    } | null>(null);
    const [copiedAddr, setCopiedAddr] = useState(false);

    // Crypto currency picker modal
    const [showCryptoPicker, setShowCryptoPicker] = useState(false);
    const [cryptoCurrencies, setCryptoCurrencies] = useState<string[]>([]);
    const [cryptoSearch, setCryptoSearch] = useState("");
    const [loadingCurrencies, setLoadingCurrencies] = useState(false);
    const [currenciesLoaded, setCurrenciesLoaded] = useState(false);

    const balance = (session?.user as any)?.prxBalance ?? 0;
    const prxAmount = Number(inputPrx) || 0;
    const tier = useMemo(() => getBonus(prxAmount), [prxAmount]);
    const bonusPrx = Math.floor(prxAmount * (tier.bonus / 100));
    const totalPrx = prxAmount + bonusPrx;
    const usdCost = prxAmount / BASE_RATE;

    // Load payment methods from DB
    useEffect(() => {
        fetch("/api/payment-methods")
            .then((r) => r.json())
            .then((data) => { if (data.ok) setMethods(data.methods); })
            .finally(() => setLoadingMethods(false));
    }, []);

    // Load crypto currencies on demand
    const loadCurrencies = useCallback(async () => {
        if (currenciesLoaded) return;
        setLoadingCurrencies(true);
        try {
            const res = await fetch("/api/crypto-currencies");
            const data = await res.json();
            if (data.ok) { setCryptoCurrencies(data.currencies); setCurrenciesLoaded(true); }
        } catch { /* ignore */ }
        setLoadingCurrencies(false);
    }, [currenciesLoaded]);

    // Polling logic
    useEffect(() => {
        if (!pollingTxId) { setPollElapsed(0); return; }
        const startTime = Date.now();
        const tick = setInterval(() => setPollElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
        const poll = setInterval(async () => {
            try {
                const res = await fetch(`/api/topup/status?txId=${pollingTxId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "COMPLETED") {
                        setPollStatus({ status: "COMPLETED", amountPrx: data.amountPrx, cardLast4: data.cardLast4, cardBrand: data.cardBrand });
                        setPollingTxId(null);
                        update();
                    } else if (data.status === "FAILED" || data.status === "EXPIRED") {
                        setPollStatus({ status: data.status === "EXPIRED" ? "EXPIRED" : "FAILED" });
                        setPollingTxId(null);
                    }
                }
            } catch (err) { console.error("Polling error:", err); }
        }, 3000);
        return () => { clearInterval(poll); clearInterval(tick); };
    }, [pollingTxId]);

    useEffect(() => {
        if (searchParams.get("success") === "true") toast.success("Payment successful! PRX will be credited shortly.", { duration: 5000 });
        if (searchParams.get("cancelled") === "true") toast.error("Payment was cancelled.", { duration: 3000 });
    }, [searchParams]);

    const handleMethodSelect = (method: PaymentMethod) => {
        if (!method.enabled) {
            toast.error(`${method.name} is currently disabled by administrator.`, { description: "Please choose another payment method." });
            return;
        }
        setSelectedMethod(method.id);
    };

    // Create payment (called directly for card, or after crypto selection)
    const createPayment = async (payCurrency?: string) => {
        if (!session?.user) { router.push("/auth/signin?callbackUrl=/topup"); return; }
        if (prxAmount < 50) { toast.error("Minimum top-up is 50 PRX"); return; }
        if (!selectedMethod) { toast.error("Please select a payment method"); return; }

        const method = methods.find((m) => m.id === selectedMethod);
        if (method && !method.enabled) { toast.error(`${method.name} is disabled. Choose another method.`); setSelectedMethod(null); return; }

        setProcessing(true);
        const isCrypto = method?.code === "crypto";

        let paymentWindow: Window | null = null;
        if (!isCrypto) {
            paymentWindow = window.open("", "_blank");
            if (paymentWindow) paymentWindow.document.write("Loading payment gateway...");
        }

        try {
            const res = await fetch("/api/topup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prxAmount, paymentMethodId: selectedMethod, payCurrency: isCrypto ? payCurrency : undefined }),
            });
            const data = await res.json();

            if (!data.ok) {
                if (paymentWindow) paymentWindow.close();
                toast.error(data.error || "Failed to create payment");
                if (data._admin) toast.info("Admin info", { description: data._admin, duration: 8000 });
                return;
            }

            if (data.cryptoPayment && data.transactionId) {
                setCryptoPayment(data.cryptoPayment);
                setPollingTxId(data.transactionId);
                setPollStatus({ status: "PENDING" });
                return;
            }

            if (data.redirectUrl && data.transactionId) {
                toast.loading("Opening payment window...");
                if (paymentWindow) paymentWindow.location.href = data.redirectUrl;
                else window.location.href = data.redirectUrl;
                setPollingTxId(data.transactionId);
                setPollStatus({ status: "PENDING" });
            } else if (data.redirectUrl) {
                if (paymentWindow) paymentWindow.location.href = data.redirectUrl;
                else window.location.href = data.redirectUrl;
            }
        } catch {
            if (paymentWindow) paymentWindow.close();
            toast.error("Network error. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleTopUp = async () => {
        if (!session?.user) { router.push("/auth/signin?callbackUrl=/topup"); return; }
        if (prxAmount < 50) { toast.error("Minimum top-up is 50 PRX"); return; }
        if (!selectedMethod) { toast.error("Please select a payment method"); return; }

        const method = methods.find((m) => m.id === selectedMethod);
        if (method?.code === "crypto") {
            // Open crypto picker modal instead of paying immediately
            setShowCryptoPicker(true);
            loadCurrencies();
            return;
        }

        await createPayment();
    };

    const handleCryptoSelect = async (currency: string) => {
        setShowCryptoPicker(false);
        setCryptoSearch("");
        await createPayment(currency);
    };

    // Split currencies into popular (with icons) and others
    const popularCurrencies = cryptoCurrencies.filter((c) => cryptoMeta[c]);
    const otherCurrencies = cryptoCurrencies.filter((c) => !cryptoMeta[c]);
    const filteredPopular = cryptoSearch ? popularCurrencies.filter((c) => c.includes(cryptoSearch.toLowerCase()) || getCryptoName(c).toLowerCase().includes(cryptoSearch.toLowerCase())) : popularCurrencies;
    const filteredOther = cryptoSearch ? otherCurrencies.filter((c) => c.includes(cryptoSearch.toLowerCase()) || getCryptoName(c).toLowerCase().includes(cryptoSearch.toLowerCase())) : otherCurrencies;

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <Zap size={28} className="text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold mb-2">Top Up PRX</h1>
                    <p className="text-sm text-muted-foreground">
                        Buy more, get more. Volume bonuses up to <strong>15%</strong> extra PRX.
                    </p>
                </div>

                {/* Auth banner */}
                {!session?.user && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6 flex items-center gap-3">
                        <LogIn size={18} className="text-primary shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Sign in to top up</p>
                            <p className="text-xs text-muted-foreground">You need an account to add PRX</p>
                        </div>
                        <button onClick={() => router.push("/auth/signin?callbackUrl=/topup")} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground h-8 rounded-md px-3 text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer shrink-0">
                            Sign In
                        </button>
                    </div>
                )}

                {/* Current balance */}
                <div className="rounded-xl border bg-card p-5 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Zap size={18} className="text-primary" />
                        </div>
                        <span className="text-sm">Current Balance</span>
                    </div>
                    <div className="text-lg font-bold font-mono">
                        {session?.user ? balance.toFixed(0) : "—"} <span className="text-xs font-normal text-muted-foreground">PRX</span>
                    </div>
                </div>

                {/* ── Calculator ──────────────────────── */}
                <div className="rounded-xl border bg-card overflow-hidden mb-6">
                    <div className="p-5 border-b">
                        <label className="text-sm font-medium mb-3 block">Enter PRX Amount</label>
                        <div className="relative">
                            <Zap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                            <input
                                type="number"
                                placeholder="Enter amount (min. 50)"
                                value={inputPrx}
                                onChange={(e) => setInputPrx(e.target.value)}
                                className="border-input flex h-12 w-full rounded-lg border bg-transparent pl-10 pr-20 text-lg font-mono shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">PRX</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {quickAmounts.map((a) => (
                                <button
                                    key={a}
                                    onClick={() => setInputPrx(String(a))}
                                    className={`text-xs border rounded-md px-3 py-1.5 font-mono transition-all cursor-pointer ${Number(inputPrx) === a ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/30 text-muted-foreground hover:text-foreground"}`}
                                >
                                    {a.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversion breakdown */}
                    <div className="p-5 bg-muted/10">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Base PRX</span>
                                <span className="font-mono">{prxAmount.toLocaleString()} PRX</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <Gift size={14} className="text-primary" />
                                    Volume Bonus
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tier.bonus > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                                        {tier.label}
                                    </span>
                                </span>
                                <span className={`font-mono ${bonusPrx > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                                    +{bonusPrx.toLocaleString()} PRX
                                </span>
                            </div>
                            <div className="h-px bg-border" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">You receive</span>
                                <span className="text-lg font-bold font-mono flex items-center gap-1.5">
                                    <Zap size={16} className="text-primary" />
                                    {totalPrx.toLocaleString()} PRX
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">You pay</span>
                                <span className="text-lg font-bold font-mono">
                                    ${usdCost.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">USD</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bonus Tiers ─────────────────────── */}
                <div className="rounded-xl border bg-card p-5 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Percent size={16} className="text-primary" />
                        <span className="text-sm font-medium">Volume Bonus Tiers</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {bonusTiers.map((t) => (
                            <div
                                key={t.min}
                                className={`rounded-lg border p-2.5 text-center transition-all ${prxAmount >= t.min && prxAmount <= t.max ? "border-primary bg-primary/5" : ""}`}
                            >
                                <div className={`text-sm font-bold ${t.bonus > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                                    {t.bonus > 0 ? `+${t.bonus}%` : "0%"}
                                </div>
                                <div className="text-[9px] text-muted-foreground mt-0.5">
                                    {t.max === Infinity ? `${(t.min / 1000).toFixed(0)}k+` : t.min >= 1000 ? `${(t.min / 1000).toFixed(0)}k` : `${t.min}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Payment Methods (from DB) ──────── */}
                <div className="rounded-xl border bg-card p-5 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard size={16} className="text-primary" />
                        <span className="text-sm font-medium">Payment Method</span>
                    </div>

                    {loadingMethods ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 size={20} className="animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {methods.map((m) => {
                                const isSelected = selectedMethod === m.id;
                                const icon = methodIcons[m.code] || (
                                    <div className="w-10 h-7 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                        {m.code.slice(0, 3).toUpperCase()}
                                    </div>
                                );

                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => handleMethodSelect(m)}
                                        className={`flex items-center gap-3 rounded-lg border p-3.5 transition-all text-left
                                            ${!m.enabled
                                                ? "opacity-40 cursor-not-allowed border-border bg-muted/5"
                                                : isSelected
                                                    ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
                                                    : "hover:border-muted-foreground/30 hover:bg-muted/20 cursor-pointer"
                                            }`}
                                    >
                                        <div className={!m.enabled ? "grayscale" : ""}>{icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium truncate ${!m.enabled ? "text-muted-foreground" : ""}`}>
                                                    {m.name}
                                                </span>
                                                {!m.enabled && (
                                                    <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">
                                                        Disabled
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate block">{m.description}</span>
                                        </div>
                                        {isSelected && m.enabled && (
                                            <CheckCircle size={16} className="text-primary shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Top Up Button ───────────────────── */}
                <button
                    onClick={handleTopUp}
                    disabled={processing || prxAmount < 50 || !selectedMethod}
                    className="w-full inline-flex items-center justify-center rounded-xl text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-12 px-4 transition-all cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                    {processing ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : !session?.user ? (
                        <>
                            <LogIn size={16} />
                            Sign in to Top Up
                        </>
                    ) : (
                        <>
                            <Zap size={16} />
                            Top Up {totalPrx.toLocaleString()} PRX for ${usdCost.toFixed(2)}
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>

                {/* Security note */}
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pb-8">
                    <span className="flex items-center gap-1.5"><Lock size={12} /> Encrypted</span>
                    <span className="flex items-center gap-1.5"><Zap size={12} /> Instant credit</span>
                    <span className="flex items-center gap-1.5"><Shield size={12} /> Secure payment</span>
                </div>
            </div>

            {/* ── Crypto Currency Picker Modal ───────── */}
            {showCryptoPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg rounded-xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="p-5 border-b flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold">Choose Cryptocurrency</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Select which crypto you want to pay with</p>
                            </div>
                            <button
                                onClick={() => { setShowCryptoPicker(false); setCryptoSearch(""); }}
                                className="inline-flex items-center justify-center rounded-md border hover:bg-accent size-8 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b shrink-0">
                            <div className="relative">
                                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search cryptocurrency..."
                                    value={cryptoSearch}
                                    onChange={(e) => setCryptoSearch(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border bg-transparent outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 p-4">
                            {loadingCurrencies ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 size={24} className="animate-spin text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Loading currencies...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Popular currencies — grid with icons */}
                                    {filteredPopular.length > 0 && (
                                        <div className="mb-4">
                                            {!cryptoSearch && <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 px-1">Popular</p>}
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                {filteredPopular.map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => handleCryptoSelect(c)}
                                                        disabled={processing}
                                                        className="flex flex-col items-center gap-2 rounded-xl border p-3.5 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                                                    >
                                                        <div className="transition-transform group-hover:scale-110">
                                                            <CryptoIcon code={c} size={36} />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs font-bold font-mono">{c.toUpperCase()}</p>
                                                            <p className="text-[10px] text-muted-foreground truncate max-w-[80px]">{getCryptoName(c)}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Other currencies — compact list */}
                                    {filteredOther.length > 0 && (
                                        <div>
                                            {!cryptoSearch && <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 px-1">Other currencies</p>}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                                {filteredOther.map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => handleCryptoSelect(c)}
                                                        disabled={processing}
                                                        className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                                    >
                                                        <CryptoIcon code={c} size={24} />
                                                        <span className="text-xs font-mono font-medium">{c.toUpperCase()}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {filteredPopular.length === 0 && filteredOther.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-muted-foreground">No currencies found for &quot;{cryptoSearch}&quot;</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t shrink-0 bg-muted/10">
                            <p className="text-[10px] text-muted-foreground text-center">
                                Powered by NOWPayments · Fixed exchange rate · Payment expires in ~20 min
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Polling Modal ──────────────────────── */}
            {pollStatus && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-sm rounded-xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            {pollStatus.status === "PENDING" && !cryptoPayment && (
                                <>
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <Loader2 size={32} className="text-primary animate-spin" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2">Waiting for Payment</h2>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Complete the payment in the new tab.
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 mb-4 font-mono tabular-nums">
                                        {Math.floor(pollElapsed / 60).toString().padStart(2, "0")}:{(pollElapsed % 60).toString().padStart(2, "0")} elapsed
                                    </p>
                                    <div className="w-full bg-muted/30 rounded-full h-1 mb-4 overflow-hidden">
                                        <div className="h-full bg-primary/40 rounded-full animate-pulse" style={{ width: `${Math.min((pollElapsed / (30 * 60)) * 100, 100)}%` }} />
                                    </div>
                                    <button
                                        onClick={() => { setPollStatus(null); setPollingTxId(null); setPollElapsed(0); }}
                                        className="text-sm text-muted-foreground hover:text-foreground underline transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}

                            {pollStatus.status === "PENDING" && cryptoPayment && (
                                <>
                                    <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                                        <CryptoIcon code={cryptoPayment.payCurrency} size={40} />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2">Send {cryptoPayment.payCurrency.toUpperCase()}</h2>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Send exactly the amount below to the address provided.
                                    </p>

                                    <div className="bg-muted/20 rounded-lg border p-4 mb-4 text-left flex flex-col gap-3">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Amount</p>
                                            <p className="text-lg font-mono font-bold">{cryptoPayment.payAmount} {cryptoPayment.payCurrency.toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Network</p>
                                            <p className="text-sm font-mono">{cryptoPayment.network.toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Send to Address</p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs font-mono bg-muted/30 px-2 py-1.5 rounded break-all flex-1">{cryptoPayment.payAddress}</code>
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(cryptoPayment.payAddress); setCopiedAddr(true); toast.success("Address copied"); setTimeout(() => setCopiedAddr(false), 2000); }}
                                                    className="inline-flex items-center justify-center rounded-md border hover:bg-accent size-8 shrink-0 cursor-pointer"
                                                >
                                                    {copiedAddr ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        {cryptoPayment.payinExtraId && (
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Memo / Extra ID</p>
                                                <code className="text-xs font-mono bg-red-500/10 text-red-400 px-2 py-1.5 rounded block">{cryptoPayment.payinExtraId}</code>
                                                <p className="text-[9px] text-red-400 mt-1">Required — payment without memo cannot be detected</p>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-muted-foreground/60 mb-1 font-mono tabular-nums">
                                        {Math.floor(pollElapsed / 60).toString().padStart(2, "0")}:{(pollElapsed % 60).toString().padStart(2, "0")} elapsed
                                    </p>
                                    <div className="w-full bg-muted/30 rounded-full h-1 mb-4 overflow-hidden">
                                        <div className="h-full bg-amber-500/40 rounded-full animate-pulse" style={{ width: `${Math.min((pollElapsed / (20 * 60)) * 100, 100)}%` }} />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mb-3">Payment will be detected automatically. Do not close this page.</p>

                                    <button
                                        onClick={() => { setPollStatus(null); setPollingTxId(null); setPollElapsed(0); setCryptoPayment(null); }}
                                        className="text-sm text-muted-foreground hover:text-foreground underline transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}

                            {pollStatus.status === "COMPLETED" && (
                                <>
                                    <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle size={32} className="text-emerald-500" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {pollStatus.amountPrx ? `+${pollStatus.amountPrx.toLocaleString()} PRX` : "PRX"} credited to your account.
                                    </p>
                                    {pollStatus.cardLast4 && (
                                        <p className="text-xs text-muted-foreground/70 mb-1 font-mono">
                                            Paid with {pollStatus.cardBrand || "card"} •••• {pollStatus.cardLast4}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground/60 mb-5">Balance updated automatically.</p>
                                    <button
                                        onClick={() => { setPollStatus(null); setPollElapsed(0); setCryptoPayment(null); router.push("/dashboard"); }}
                                        className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-4 transition-all cursor-pointer gap-2"
                                    >
                                        <Zap size={14} />
                                        Go to Dashboard
                                    </button>
                                </>
                            )}

                            {(pollStatus.status === "FAILED" || pollStatus.status === "EXPIRED") && (
                                <>
                                    <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                        <AlertTriangle size={32} className="text-red-500" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2">
                                        {pollStatus.status === "EXPIRED" ? "Session Expired" : "Payment Failed"}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {pollStatus.status === "EXPIRED"
                                            ? "The payment session has expired. Please try again."
                                            : "The payment was declined or cancelled."}
                                    </p>
                                    <button
                                        onClick={() => { setPollStatus(null); setPollingTxId(null); setPollElapsed(0); setCryptoPayment(null); }}
                                        className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-4 transition-all cursor-pointer"
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
