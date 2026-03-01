"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Shield, CheckCircle, XCircle, Loader2, RefreshCw, Zap, Clock } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    pricePrx: number;
    available: number;
    totalSold: number;
}

export default function StatusPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const loadProducts = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const r = await fetch("/api/products");
            const data = await r.json();
            if (data.ok) setProducts(data.products);
            setLastUpdate(new Date());
        } catch { /* ignore */ }
        setRefreshing(false);
        setLoading(false);
    }, []);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    useEffect(() => {
        const iv = setInterval(() => loadProducts(), 30_000);
        return () => clearInterval(iv);
    }, [loadProducts]);

    const available = products.filter((p) => p.available > 0);
    const soldOut = products.filter((p) => p.available === 0);
    const totalKeys = products.reduce((s, p) => s + p.available, 0);
    const allOnline = available.length > 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={28} className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full px-4 py-8">
            <div className="max-w-4xl w-full">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield size={24} className="text-primary" />
                            <h1 className="text-2xl font-bold">Product Status</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Real-time stock and availability. Auto-refreshes every 30 seconds.
                        </p>
                    </div>
                    <button
                        onClick={() => loadProducts(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2.5 py-1.5 transition-colors cursor-pointer shrink-0"
                    >
                        <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-lg font-bold">{products.length}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">Total Products</span>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-lg font-bold">{available.length}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">In Stock</span>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-lg font-bold">{soldOut.length}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">Sold Out</span>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Zap size={14} className="text-primary" />
                            <span className="text-lg font-bold">{totalKeys}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">Keys Available</span>
                    </div>
                </div>

                {/* Status banner */}
                <div className={`flex items-center gap-3 mb-6 rounded-lg border px-4 py-3 ${allOnline ? "bg-card" : "bg-red-500/5 border-red-500/20"}`}>
                    <span className="relative flex h-2.5 w-2.5">
                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${allOnline ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${allOnline ? "bg-emerald-500" : "bg-red-500"}`} />
                    </span>
                    <span className="text-sm font-medium">{allOnline ? "All products operational" : "Some products out of stock"}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />
                        {lastUpdate.toLocaleTimeString()}
                    </span>
                </div>

                {/* Product table */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="hidden sm:grid grid-cols-[1fr_110px_90px_70px] gap-4 px-4 py-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
                        <span>Product</span>
                        <span>Status</span>
                        <span>Price</span>
                        <span>Sold</span>
                    </div>

                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.id}`}
                            className="grid grid-cols-1 sm:grid-cols-[1fr_110px_90px_70px] gap-2 sm:gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-muted/20 transition-colors items-center"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-1.5 h-8 rounded-full shrink-0 ${product.available > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                                <div className="min-w-0">
                                    <span className="text-sm font-medium block truncate">{product.name}</span>
                                    <span className="text-[11px] text-muted-foreground line-clamp-1">{product.description}</span>
                                </div>
                            </div>
                            <div>
                                {product.available > 0 ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                        <CheckCircle size={12} />
                                        {product.available} keys
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
                                        <XCircle size={12} />
                                        Sold out
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                                <Zap size={10} className="text-primary" />
                                {product.pricePrx}
                            </span>
                            <span className="text-xs text-muted-foreground">{product.totalSold}</span>
                        </Link>
                    ))}
                </div>

                <div className="mt-6 text-center text-[11px] text-muted-foreground">
                    Auto-refreshes every 30 seconds. Data is live from the database.
                </div>
            </div>
        </div>
    );
}
