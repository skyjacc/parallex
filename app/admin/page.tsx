"use client";

import { useEffect, useState } from "react";
import {
    Users, ShoppingBag, Package, Zap, TrendingUp, Loader2,
    CheckCircle, Clock, XCircle, Box,
} from "lucide-react";

interface Stats {
    totalUsers: number;
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
    totalStock: number;
    availableStock: number;
    transactions: { completed: number; pending: number; failed: number };
    recentOrders: { id: string; userName: string; userEmail: string; productName: string; costPrx: number; createdAt: string }[];
    topProducts: { name: string; sales: number; pricePrx: number }[];
}

export default function AdminOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then((r) => r.json())
            .then((d) => { if (d.ok) setStats(d.stats); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center py-20 text-sm text-muted-foreground">Failed to load stats</div>;
    }

    const txTotal = stats.transactions.completed + stats.transactions.pending + stats.transactions.failed;

    return (
        <div className="flex flex-col gap-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<TrendingUp size={18} />} label="Revenue" value={`${stats.totalRevenue.toLocaleString()} PRX`} sub={`≈ $${(stats.totalRevenue / 100).toFixed(2)}`} color="text-primary" />
                <StatCard icon={<ShoppingBag size={18} />} label="Orders" value={String(stats.totalOrders)} sub={`${stats.topProducts[0]?.name || "—"} is #1`} color="text-primary" />
                <StatCard icon={<Users size={18} />} label="Customers" value={String(stats.totalUsers)} sub={`${stats.transactions.completed} deposits`} color="text-primary" />
                <StatCard icon={<Package size={18} />} label="Products" value={String(stats.totalProducts)} sub={`${stats.availableStock}/${stats.totalStock} keys left`} color="text-primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Products */}
                <div className="lg:col-span-1 rounded-lg border bg-card overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Box size={14} className="text-muted-foreground" />
                            Top Products
                        </h3>
                    </div>
                    <div className="divide-y">
                        {stats.topProducts.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground">No sales yet</div>
                        ) : (
                            stats.topProducts.map((p, i) => {
                                const maxSales = stats.topProducts[0]?.sales || 1;
                                return (
                                    <div key={p.name} className="px-4 py-3 flex items-center gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{p.name}</p>
                                            <div className="w-full bg-muted/30 rounded-full h-1.5 mt-1.5">
                                                <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(p.sales / maxSales) * 100}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-sm font-mono">{p.sales}</span>
                                            <span className="text-xs text-muted-foreground ml-1">sold</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-2 rounded-lg border bg-card overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <ShoppingBag size={14} className="text-muted-foreground" />
                            Recent Orders
                        </h3>
                    </div>
                    {stats.recentOrders.length === 0 ? (
                        <div className="p-6 text-center text-xs text-muted-foreground">No orders yet</div>
                    ) : (
                        <div className="divide-y">
                            {stats.recentOrders.map((o) => (
                                <div key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-muted-foreground">{o.userName[0]?.toUpperCase()}</span>
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{o.userName}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">{o.productName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-mono">{o.costPrx} PRX</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction stats + Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Transactions */}
                <div className="rounded-lg border bg-card overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Zap size={14} className="text-muted-foreground" />
                            Transactions
                        </h3>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        <TxRow icon={<CheckCircle size={14} />} label="Completed" count={stats.transactions.completed} total={txTotal} color="text-emerald-400" bg="bg-emerald-500" />
                        <TxRow icon={<Clock size={14} />} label="Pending" count={stats.transactions.pending} total={txTotal} color="text-amber-400" bg="bg-amber-500" />
                        <TxRow icon={<XCircle size={14} />} label="Failed" count={stats.transactions.failed} total={txTotal} color="text-red-400" bg="bg-red-500" />
                    </div>
                </div>

                {/* Stock overview */}
                <div className="rounded-lg border bg-card overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Package size={14} className="text-muted-foreground" />
                            Stock Overview
                        </h3>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Keys</span>
                            <span className="font-mono">{stats.totalStock}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Available</span>
                            <span className="font-mono text-emerald-400">{stats.availableStock}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sold</span>
                            <span className="font-mono">{stats.totalStock - stats.availableStock}</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2">
                            <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: stats.totalStock > 0 ? `${((stats.totalStock - stats.availableStock) / stats.totalStock) * 100}%` : "0%" }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalStock > 0 ? `${(((stats.totalStock - stats.availableStock) / stats.totalStock) * 100).toFixed(0)}% sold` : "No stock"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
    return (
        <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <span className={color}>{icon}</span>
            </div>
            <p className="text-2xl font-mono font-semibold">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
        </div>
    );
}

function TxRow({ icon, label, count, total, color, bg }: { icon: React.ReactNode; label: string; count: number; total: number; color: string; bg: string }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-3">
            <span className={color}>{icon}</span>
            <span className="text-sm flex-1">{label}</span>
            <span className="text-sm font-mono w-8 text-right">{count}</span>
            <div className="w-20 bg-muted/30 rounded-full h-1.5">
                <div className={`h-full ${bg} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
