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
    key: string;
    costPrx: number;
    newBalance: number;
}

export default function ProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();

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
                toast.success("Purchase successful!", { description: `Key for ${data.productName} delivered.` });
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
                {/* Back link */}
                <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                    <ArrowLeft size={14} />
                    Back to Shop
                </Link>

                {/* Success state — show key */}
                {buyResult ? (
                    <div className="rounded-2xl border bg-card overflow-hidden">
                        <div className="p-8 text-center border-b bg-emerald-500/5">
                            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-1">Purchase Successful!</h2>
                            <p className="text-sm text-muted-foreground">
                                You bought <strong>{buyResult.productName}</strong> for {buyResult.costPrx} PRX
                            </p>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-2">YOUR KEY</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-muted/30 border rounded-lg px-4 py-3 font-mono text-sm break-all">
                                        {buyResult.key}
                                    </code>
                                    <button
                                        onClick={copyKey}
                                        className="inline-flex items-center justify-center rounded-md border hover:bg-accent hover:text-accent-foreground size-10 transition-all cursor-pointer shrink-0"
                                    >
                                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
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
                    /* Product detail card */
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left — Image */}
                        <div className="lg:col-span-3 rounded-2xl border bg-card overflow-hidden">
                            <div className="aspect-video bg-gradient-to-br from-primary/5 to-card flex items-center justify-center">
                                <Gamepad2 size={64} className="text-muted-foreground/15" />
                            </div>
                            <div className="p-6">
                                <h1 className="text-2xl font-bold mb-3">{product.name}</h1>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

                                {/* Features */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Shield size={16} className="text-emerald-500 shrink-0" />
                                        <span>Undetected & safe</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Zap size={16} className="text-primary shrink-0" />
                                        <span>Instant delivery</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Clock size={16} className="text-blue-400 shrink-0" />
                                        <span>24/7 support</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                                        <span>Daily updates</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right — Purchase card */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border bg-card p-6 sticky top-20">
                                {/* Price */}
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

                                {/* Stock info */}
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Available</span>
                                    <span className={`font-medium ${product.available > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {product.available > 0 ? `${product.available} keys` : "Out of stock"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mb-5">
                                    <span className="text-muted-foreground">Total sold</span>
                                    <span className="font-mono">{product.totalSold}</span>
                                </div>

                                {/* Balance info (if logged in) */}
                                {session?.user && (
                                    <div className="rounded-lg bg-muted/30 border p-3 mb-5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Your balance</span>
                                            <span className="font-mono flex items-center gap-1">
                                                <Zap size={12} className="text-primary" />
                                                {balance.toFixed(0)} PRX
                                            </span>
                                        </div>
                                        {!canAfford && product.available > 0 && (
                                            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                Insufficient balance. Need {(product.pricePrx - balance).toFixed(0)} more PRX.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-5 text-sm text-red-400 flex items-start gap-2">
                                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                        {error}
                                    </div>
                                )}

                                {/* Buy button */}
                                <button
                                    onClick={handleBuy}
                                    disabled={buying || product.available === 0 || (session?.user && !canAfford)}
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

                                {/* Top up link */}
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
