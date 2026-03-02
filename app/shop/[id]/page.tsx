"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
    Gamepad2,
    Zap,
    ShoppingBag,
    ArrowLeft,
    Shield,
    Clock,
    CheckCircle,
    Loader2,
    Package,
    Copy,
    Check,
    AlertTriangle,
    Users,
    Star,
    RefreshCw,
} from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    pricePrx: number;
    available: number;
    totalSold: number;
    createdAt: string;
}

interface BuyResult {
    orderId: string;
    productName: string;
    key: string | null;
    costPrx: number;
    newBalance: number;
    status: "COMPLETED" | "REVIEW";
}

const features = [
    { icon: Shield, label: "Undetected", desc: "Tested against all major anti-cheats", color: "text-emerald-500" },
    { icon: Zap, label: "Instant Delivery", desc: "Key delivered immediately after purchase", color: "text-primary" },
    { icon: RefreshCw, label: "Free Updates", desc: "Automatic updates after game patches", color: "text-blue-400" },
    { icon: Clock, label: "24/7 Support", desc: "Real human support around the clock", color: "text-amber-400" },
];

export default function ProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, update } = useSession();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [error, setError] = useState("");
    const [buyResult, setBuyResult] = useState<BuyResult | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/products/${id}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.ok) setProduct(data.product);
                else setError(data.error || "Product not found");
            })
            .catch(() => setError("Failed to load product"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleBuy = async () => {
        if (!session?.user) {
            router.push(`/auth/signin?callbackUrl=/shop/${id}`);
            return;
        }

        setBuying(true);
        setError("");

        try {
            const res = await fetch(`/api/products/${id}/buy`, { method: "POST" });
            const data = await res.json();

            if (data.ok) {
                setBuyResult(data);
                update();
                if (data.status === "REVIEW") {
                    toast.info("Order under review", { description: "Your purchase is being reviewed. Key will be delivered after approval." });
                } else {
                    toast.success("Purchase successful!", { description: `Key for ${data.productName} delivered.` });
                }
            } else {
                setError(data.error || "Purchase failed");
                toast.error(data.error || "Purchase failed");
            }
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setBuying(false);
        }
    };

    const copyKey = () => {
        if (buyResult?.key) {
            navigator.clipboard.writeText(buyResult.key);
            setCopied(true);
            toast.success("Key copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={28} className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Package size={48} className="text-muted-foreground/30" />
                <p className="text-lg font-medium">Product not found</p>
                <Link href="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Shop
                </Link>
            </div>
        );
    }

    const balance = (session?.user as any)?.prxBalance ?? 0;
    const canAfford = balance >= product.pricePrx;

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-4xl w-full">
                <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                    <ArrowLeft size={14} />
                    Back to Shop
                </Link>

                {buyResult ? (
                    <div className="rounded-2xl border bg-card overflow-hidden">
                        <div className={`p-8 text-center border-b ${buyResult.status === "REVIEW" ? "bg-amber-500/5" : "bg-emerald-500/5"}`}>
                            {buyResult.status === "REVIEW" ? (
                                <>
                                    <Clock size={48} className="text-amber-400 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold mb-1">Order Under Review</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Your purchase of <strong>{buyResult.productName}</strong> is being reviewed. Key will be delivered after approval.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold mb-1">Purchase Successful!</h2>
                                    <p className="text-sm text-muted-foreground">
                                        You bought <strong>{buyResult.productName}</strong> for {buyResult.costPrx} PRX
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            {buyResult.key ? (
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-2">YOUR KEY</label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-muted/30 border rounded-lg px-4 py-3 font-mono text-sm break-all">
                                            {buyResult.key}
                                        </code>
                                        <button onClick={copyKey} className="inline-flex items-center justify-center rounded-md border hover:bg-accent hover:text-accent-foreground size-10 transition-all cursor-pointer shrink-0">
                                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-4 text-center">
                                    <p className="text-sm text-amber-400">Your key will appear here and in your dashboard once approved.</p>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Order ID</span>
                                <code className="text-xs font-mono bg-muted/40 px-1.5 py-0.5 rounded">{buyResult.orderId}</code>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Remaining Balance</span>
                                <span className="font-mono flex items-center gap-1">
                                    <Zap size={14} className="text-primary" />
                                    {buyResult.newBalance.toFixed(0)} PRX
                                </span>
                            </div>
                        </div>
                        <div className="p-6 border-t flex gap-3">
                            <Link href="/dashboard" className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-10 px-4 transition-all cursor-pointer gap-2">
                                <Package size={16} />
                                My Orders
                            </Link>
                            <Link href="/shop" className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-4 transition-all cursor-pointer gap-2">
                                <ShoppingBag size={16} />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left — Product details */}
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <div className="rounded-2xl border bg-card overflow-hidden">
                                <div className="aspect-[2/1] bg-gradient-to-br from-primary/5 via-card to-primary/3 flex items-center justify-center relative">
                                    <Gamepad2 size={72} className="text-muted-foreground/10" />
                                    <div className="absolute top-3 left-3">
                                        <span className={`text-[10px] border rounded px-2 py-1 font-medium ${product.available > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                            {product.available > 0 ? `${product.available} in stock` : "Out of stock"}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur border rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                                        <Zap size={14} className="text-primary" />
                                        <span className="font-bold text-sm font-mono">{product.pricePrx} PRX</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h1 className="text-2xl font-bold">{product.name}</h1>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 mt-1">
                                            <Users size={12} />
                                            {product.totalSold} sold
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
                                </div>
                            </div>

                            {/* Features grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {features.map((f) => {
                                    const Icon = f.icon;
                                    return (
                                        <div key={f.label} className="rounded-xl border bg-card p-4 flex gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                                                <Icon size={18} className={f.color} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{f.label}</p>
                                                <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right — Purchase card */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border bg-card p-6 sticky top-20">
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold font-mono flex items-center justify-center gap-2 mb-1">
                                        <Zap size={24} className="text-primary" />
                                        {product.pricePrx} PRX
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        ≈ ${(product.pricePrx / 100).toFixed(2)} USD
                                    </p>
                                </div>

                                <div className="h-px bg-border mb-5" />

                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Available</span>
                                    <span className={`font-medium ${product.available > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {product.available > 0 ? `${product.available} keys` : "Out of stock"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Total sold</span>
                                    <span className="font-mono">{product.totalSold}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-5">
                                    <span className="text-muted-foreground">Delivery</span>
                                    <span className="text-emerald-400 flex items-center gap-1"><Zap size={12} /> Instant</span>
                                </div>

                                {session?.user && (
                                    <div className="rounded-lg bg-muted/30 border p-3 mb-5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Your balance</span>
                                            <span className="font-mono flex items-center gap-1">
                                                <Zap size={12} className="text-primary" />
                                                {balance} PRX
                                            </span>
                                        </div>
                                        {canAfford && product.available > 0 && (
                                            <div className="flex justify-between text-sm mt-1.5">
                                                <span className="text-muted-foreground">After purchase</span>
                                                <span className="font-mono text-muted-foreground">{balance - product.pricePrx} PRX</span>
                                            </div>
                                        )}
                                        {!canAfford && product.available > 0 && (
                                            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                Need {product.pricePrx - balance} more PRX
                                            </p>
                                        )}
                                    </div>
                                )}

                                {error && (
                                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-5 text-sm text-red-400 flex items-start gap-2">
                                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleBuy}
                                    disabled={buying || product.available === 0 || (!!session?.user && !canAfford)}
                                    className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-11 px-4 transition-all cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {buying ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <ShoppingBag size={16} />
                                    )}
                                    {!session?.user
                                        ? "Sign in to Buy"
                                        : product.available === 0
                                        ? "Out of Stock"
                                        : !canAfford
                                        ? "Insufficient Balance"
                                        : buying
                                        ? "Processing..."
                                        : "Buy Now"}
                                </button>

                                {session?.user && !canAfford && product.available > 0 && (
                                    <Link
                                        href="/topup"
                                        className="w-full mt-3 inline-flex items-center justify-center rounded-lg text-sm font-medium border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-10 px-4 transition-all cursor-pointer gap-2"
                                    >
                                        <Zap size={14} />
                                        Top Up PRX
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
