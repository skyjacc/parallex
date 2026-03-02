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

/* ── Crypto coin SVG icons ───────────────────────────────── */
const cryptoIcons: Record<string, { icon: React.ReactNode; color: string; name: string }> = {
    btc: {
        name: "Bitcoin",
        color: "#F7931A",
        icon: <path d="M23.6 14.9c.3-2 -1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.8-.2-1.2-.3l.7-2.6-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.3l-2-.5-.4 1.7s1.2.3 1.2.3c.6.2.7.6.7.9l-.7 2.9c0 0 .1 0 .1 0l-.1 0-.9 3.8c-.1.2-.3.6-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 1.9.5.9.2-.7 2.7 1.6.4.7-2.7c.4.1.8.2 1.2.3l-.7 2.7 1.6.4.7-2.7c2.8.5 4.9.3 5.8-2.2.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2-4 .9-5.1.7l.9-3.7c1.1.3 4.7.8 4.2 3zm.5-5.3c-.5 1.8-3.4.9-4.3.7l.8-3.3c.9.2 4 .7 3.5 2.6z" />,
    },
    eth: {
        name: "Ethereum",
        color: "#627EEA",
        icon: <><path d="M16 3l-7 11.5L16 18.5l7-4L16 3z" opacity="0.6" /><path d="M9 14.5L16 29l7-14.5-7 4-7-4z" /><path d="M16 18.5v-15.5l-7 11.5 7 4z" opacity="0.4" /></>,
    },
    usdt: {
        name: "Tether",
        color: "#26A17B",
        icon: <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm5.2 9.2h-2.8v1.6c2.6.1 4.5.6 4.5 1.2s-1.9 1.1-4.5 1.2v4.4h-3.8v-4.4c-2.6-.1-4.5-.6-4.5-1.2s1.9-1.1 4.5-1.2v-1.6h-2.8V10h10v3.2z" />,
    },
    ltc: {
        name: "Litecoin",
        color: "#BFBBBB",
        icon: <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm1.5 17.5h-6.3l.7-2.8-1.8.7.4-1.8 1.8-.7 1.8-7h3.2l-1.4 5.5 1.8-.7-.4 1.8-1.8.7-.7 2.8h4.7v1.5z" />,
    },
    xmr: {
        name: "Monero",
        color: "#FF6600",
        icon: <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm0 2.4l5.6 5.6v6h-2.4v-4.4L16 16.8l-3.2-3.2v4.4h-2.4v-6L16 6.4zm-8.8 14h2v-3.6l2 2 .8-.8-3.6-3.6v6h-1.2zm17.6 0h-1.2v-6l-3.6 3.6.8.8 2-2v3.6h2v-.4z" />,
    },
    trx: {
        name: "TRON",
        color: "#FF0013",
        icon: <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm-3 6h9.5l-9 13.5V10zm1.5 2v7.5l5.5-8.2h-5.5z" />,
    },
    sol: {
        name: "Solana",
        color: "#9945FF",
        icon: <><path d="M8 19.5l2.5-2.5h13l-2.5 2.5H8z" /><path d="M8 12.5l2.5-2.5h13l-2.5 2.5H8z" opacity="0.7" /><path d="M23.5 15H10.5L8 17.5h13l2.5-2.5z" opacity="0.4" /></>,
    },
    doge: {
        name: "Dogecoin",
        color: "#C2A633",
        icon: <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm-.5 5h3c3.3 0 6 2.7 6 6s-2.7 6-6 6h-3V9zm2.5 2.5v7c2.2 0 3.5-1.6 3.5-3.5s-1.3-3.5-3.5-3.5zm-2.5.5h-2v2h2v-2zm0 4h-2v2h2v-2z" />,
    },
    bnb: {
        name: "BNB",
        color: "#F3BA2F",
        icon: <><path d="M16 6l2.5 2.5-2.5 2.5-2.5-2.5L16 6z" /><path d="M22 12l2.5 2.5L22 17l-2.5-2.5L22 12z" /><path d="M10 12l2.5 2.5L10 17l-2.5-2.5L10 12z" /><path d="M16 18l2.5 2.5L16 23l-2.5-2.5L16 18z" /><path d="M16 12l2.5 2.5L16 17l-2.5-2.5L16 12z" /></>,
    },
    matic: {
        name: "Polygon",
        color: "#8247E5",
        icon: <path d="M20.5 14.2l-3-1.7c-.3-.2-.7-.2-1 0l-2.4 1.4-1.6-.9 2.4-1.4c.3-.2.5-.5.5-.9s-.2-.7-.5-.9l-3-1.7c-.3-.2-.7-.2-1 0l-3 1.7c-.3.2-.5.5-.5.9v3.4c0 .4.2.7.5.9l3 1.7c.3.2.7.2 1 0l2.4-1.4 1.6.9-2.4 1.4c-.3.2-.5.5-.5.9s.2.7.5.9l3 1.7c.3.2.7.2 1 0l3-1.7c.3-.2.5-.5.5-.9v-3.4c0-.4-.2-.7-.5-.9z" />,
    },
    usdc: {
        name: "USD Coin",
        color: "#2775CA",
        icon: <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm4.8 14.4c0 2.4-2 3.6-4.8 3.6s-4.8-1.2-4.8-3.6h2.4c0 .8.8 1.2 2.4 1.2s2.4-.4 2.4-1.2c0-.6-.4-1-1.6-1.2l-1.6-.4c-2-.4-3.2-1.2-3.2-3 0-2 2-3.2 4.4-3.2 2.4 0 4.4 1.2 4.4 3.2h-2.4c0-.8-.8-1.2-2-1.2s-2 .4-2 1c0 .6.4.8 1.6 1.2l1.6.4c2 .4 3.2 1.4 3.2 3.2z" />,
    },
    ada: {
        name: "Cardano",
        color: "#0033AD",
        icon: <><circle cx="16" cy="8" r="2" /><circle cx="16" cy="24" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="23" cy="12" r="2" /><circle cx="9" cy="20" r="2" /><circle cx="23" cy="20" r="2" /><circle cx="16" cy="16" r="3" /></>,
    },
    dot: {
        name: "Polkadot",
        color: "#E6007A",
        icon: <><circle cx="16" cy="8" r="3.5" /><circle cx="16" cy="24" r="3.5" /><ellipse cx="16" cy="16" rx="6" ry="3" fill="none" stroke="currentColor" strokeWidth="2" /></>,
    },
    avax: {
        name: "Avalanche",
        color: "#E84142",
        icon: <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm4.5 16h-2.8c-.4 0-.7-.2-.9-.5l-1-1.8c-.2-.3-.5-.3-.7 0l-1 1.8c-.2.3-.5.5-.9.5h-2.7l5.5-9.5 4 7z" />,
    },
    xlm: {
        name: "Stellar",
        color: "#14B6E7",
        icon: <path d="M22.5 8.5l-1.5 1c-2.5-2-6-2.5-9-1.5L7 10.5l-1.5-1 6-3c3.5-1.5 7.5-.5 11 2zm-13 15l1.5-1c2.5 2 6 2.5 9 1.5l5-2.5 1.5 1-6 3c-3.5 1.5-7.5.5-11-2zm-3-7.5l15-7.5 1.5 1-15 7.5-1.5-1zm8 5l15-7.5-1.5-1-15 7.5 1.5 1z" />,
    },
    xrp: {
        name: "XRP",
        color: "#23292F",
        icon: <path d="M10 8l3.5 4L10 16h2.5l2-2.3c.3-.3.7-.3 1 0l2 2.3H20l-3.5-4L20 8h-2.5l-2 2.3c-.3.3-.7.3-1 0L12.5 8H10z" />,
    },
};

/* Fallback icon for unknown coins */
function CryptoIcon({ code, size = 32 }: { code: string; size?: number }) {
    const info = cryptoIcons[code];
    if (info) {
        return (
            <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill={info.color} />
                <g fill="white">{info.icon}</g>
            </svg>
        );
    }
    // Fallback: colored circle with first letter(s)
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
    return cryptoIcons[code]?.name || code.toUpperCase();
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
    const popularCurrencies = cryptoCurrencies.filter((c) => cryptoIcons[c]);
    const otherCurrencies = cryptoCurrencies.filter((c) => !cryptoIcons[c]);
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
