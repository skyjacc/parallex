"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Shield, Loader2, RefreshCw, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface Product {
    id: string;
    name: string;
    pricePrx: number;
    available: number;
    category: string | null;
    categorySlug: string | null;
    cheatType: string | null;
    detectionStatus: string;
    updatedAt: string;
}

interface Category { name: string; slug: string; productCount: number }

const statusStyle: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    UNDETECTED: { label: "Undetected", color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-500" },
    TESTING: { label: "Testing", color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-500" },
    UPDATING: { label: "Updating", color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-500" },
};

function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export default function StatusPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const load = useCallback(async (spin = false) => {
        if (spin) setRefreshing(true);
        try {
            const r = await fetch("/api/products");
            const d = await r.json();
            if (d.ok) {
                setProducts(d.products);
                setCategories(d.categories || []);
                setLastUpdate(new Date());
            }
        } catch { /* ignore */ }
        setRefreshing(false);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { const iv = setInterval(() => load(), 60_000); return () => clearInterval(iv); }, [load]);

    const grouped: Record<string, Product[]> = {};
    for (const p of products) {
        const cat = p.category || "Other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    }

    const catOrder = categories.map((c) => c.name);
    const sortedCats = Object.keys(grouped).sort((a, b) => {
        const ia = catOrder.indexOf(a);
        const ib = catOrder.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    const totalProducts = products.length;
    const undetected = products.filter((p) => p.detectionStatus === "UNDETECTED").length;
    const testing = products.filter((p) => p.detectionStatus === "TESTING").length;
    const updating = products.filter((p) => p.detectionStatus === "UPDATING").length;

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="flex flex-col items-center w-full px-4 py-8">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield size={24} className="text-primary" />
                            <h1 className="text-2xl font-bold">Status</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Detection status for all products. Auto-refreshes every minute.
                        </p>
                    </div>
                    <button onClick={() => load(true)} disabled={refreshing} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2.5 py-1.5 transition-colors cursor-pointer shrink-0">
                        <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <p className="text-lg font-bold">{totalProducts}</p>
                        <p className="text-[11px] text-muted-foreground">Total Products</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <p className="text-lg font-bold text-emerald-400">{undetected}</p>
                        <p className="text-[11px] text-muted-foreground">Undetected</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <p className="text-lg font-bold text-amber-400">{testing}</p>
                        <p className="text-[11px] text-muted-foreground">Testing</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <p className="text-lg font-bold text-blue-400">{updating}</p>
                        <p className="text-[11px] text-muted-foreground">Updating</p>
                    </div>
                </div>

                {/* Status banner */}
                <div className={`flex items-center gap-3 mb-8 rounded-lg border px-4 py-3 ${updating === 0 && testing === 0 ? "bg-card" : "bg-amber-500/5 border-amber-500/20"}`}>
                    <span className="relative flex h-2.5 w-2.5">
                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${updating === 0 && testing === 0 ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${updating === 0 && testing === 0 ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </span>
                    <span className="text-sm font-medium">
                        {updating === 0 && testing === 0 ? "All products operational" : `${updating + testing} product${updating + testing > 1 ? "s" : ""} being updated or tested`}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />
                        {lastUpdate.toLocaleTimeString()}
                    </span>
                </div>

                {/* Categories with products */}
                <div className="flex flex-col gap-6">
                    {sortedCats.map((catName) => {
                        const prods = grouped[catName];
                        return (
                            <div key={catName} className="rounded-xl border bg-card overflow-hidden">
                                <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold">{catName}</h2>
                                    <span className="text-[10px] text-muted-foreground">{prods.length} product{prods.length > 1 ? "s" : ""}</span>
                                </div>
                                <div className="divide-y">
                                    {prods.map((p) => {
                                        const st = statusStyle[p.detectionStatus] || statusStyle.UNDETECTED;
                                        return (
                                            <Link
                                                key={p.id}
                                                href={`/shop/${p.id}`}
                                                className="flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors gap-3"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <span className={`w-1.5 h-6 rounded-full shrink-0 ${st.dot}`} />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{p.name}</p>
                                                        <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1.5">
                                                            {p.cheatType && <span>{p.cheatType.toLowerCase()}</span>}
                                                            {p.cheatType && <span>·</span>}
                                                            <span>Last Update: {timeAgo(p.updatedAt)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md shrink-0 ${st.bg} ${st.color}`}>
                                                    {p.detectionStatus === "UNDETECTED" && <CheckCircle size={11} />}
                                                    {p.detectionStatus === "TESTING" && <AlertTriangle size={11} />}
                                                    {p.detectionStatus === "UPDATING" && <RefreshCw size={11} />}
                                                    {st.label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center text-[11px] text-muted-foreground">
                    Auto-refreshes every 60 seconds. Data is live from the database.
                </div>
            </div>
        </div>
    );
}
