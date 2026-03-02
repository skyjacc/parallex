"use client";

import { useEffect, useState } from "react";
import {
    Users, ShoppingBag, Package, Zap, TrendingUp, Loader2,
    CheckCircle, Clock, XCircle, Box, AlertTriangle,
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Stats {
    totalUsers: number;
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
    totalStock: number;
    availableStock: number;
    reviewCount: number;
    transactions: { completed: number; pending: number; failed: number; completedSum: number; pendingSum: number; failedSum: number };
    dailyChart: { name: string; orders: number; revenue: number }[];
    recentOrders: { id: string; userName: string; productName: string; costPrx: number; createdAt: string }[];
    topProducts: { name: string; sales: number; pricePrx: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-popover border rounded-lg px-3 py-2 shadow-lg text-sm">
            <p className="text-muted-foreground mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color }} className="font-mono font-medium">
                    {p.name}: {p.value.toLocaleString()}
                </p>
            ))}
        </div>
    );
}

const PIE_COLORS = ["oklch(72% 0.19 145)", "oklch(80% 0.15 80)", "oklch(65% 0.2 25)"];

export default function AdminOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        fetch("/api/admin/stats").then((r) => r.json()).then((d) => { if (d.ok) setStats(d.stats); }).finally(() => setLoading(false));
    }, []);

    if (loading || !stats) {
        return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
    }

    const txTotal = stats.transactions.completed + stats.transactions.pending + stats.transactions.failed;
    const pieData = [
        { name: "Completed", value: stats.transactions.completedSum, count: stats.transactions.completed },
        { name: "Pending", value: stats.transactions.pendingSum, count: stats.transactions.pending },
        { name: "Failed", value: stats.transactions.failedSum, count: stats.transactions.failed },
    ].filter((d) => d.count > 0);

    return (
        <div className="flex flex-col gap-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<TrendingUp size={18} />} label="Revenue" value={`${stats.totalRevenue.toLocaleString()} PRX`} sub={`~ $${(stats.totalRevenue / 100).toFixed(2)}`} />
                <StatCard icon={<ShoppingBag size={18} />} label="Orders" value={String(stats.totalOrders)} sub={stats.reviewCount > 0 ? `${stats.reviewCount} in review` : "All clear"} />
                <StatCard icon={<Users size={18} />} label="Customers" value={String(stats.totalUsers)} sub={`${stats.transactions.completed} deposits`} />
                <StatCard icon={<Package size={18} />} label="Stock" value={`${stats.availableStock}/${stats.totalStock}`} sub={`${stats.totalProducts} products`} />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border rounded-lg overflow-hidden bg-border">
                {/* Revenue chart */}
                <div className="flex flex-col gap-3 p-5 bg-background">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><TrendingUp size={12} /> Revenue (7 days)</p>
                            <p className="text-2xl font-mono font-semibold mt-1">{stats.dailyChart.reduce((s, d) => s + d.revenue, 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">PRX</span></p>
                        </div>
                    </div>
                    <div className="h-52 w-full">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.dailyChart}>
                                    <defs>
                                        <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="oklch(92.47% 0.0524 66.1732)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="oklch(92.47% 0.0524 66.1732)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0 0)" />
                                    <XAxis dataKey="name" tick={{ fill: "oklch(60% 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "oklch(60% 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="oklch(92.47% 0.0524 66.1732)" fill="url(#gRev)" strokeWidth={2} name="Revenue" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Sales chart */}
                <div className="flex flex-col gap-3 p-5 bg-background">
                    <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><ShoppingBag size={12} /> Sales (7 days)</p>
                        <p className="text-2xl font-mono font-semibold mt-1">{stats.dailyChart.reduce((s, d) => s + d.orders, 0)}</p>
                    </div>
                    <div className="h-52 w-full">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.dailyChart}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0 0)" />
                                    <XAxis dataKey="name" tick={{ fill: "oklch(60% 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "oklch(60% 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="orders" fill="oklch(92.47% 0.0524 66.1732)" radius={[4, 4, 0, 0]} name="Orders" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="flex flex-col gap-3 p-5 bg-background">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Box size={12} /> Top Products</p>
                    <div className="flex flex-col gap-2 flex-1 justify-center">
                        {stats.topProducts.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">No sales yet</p>
                        ) : stats.topProducts.map((p, i) => {
                            const max = stats.topProducts[0]?.sales || 1;
                            return (
                                <div key={p.name} className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium truncate">{p.name}</p>
                                        <div className="w-full bg-muted/30 rounded-full h-1.5 mt-1">
                                            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(p.sales / max) * 100}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono shrink-0">{p.sales}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Transactions Pie */}
                <div className="flex flex-col gap-3 p-5 bg-background">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Zap size={12} /> Transactions</p>
                    <div className="flex items-center gap-6 flex-1">
                        <div className="h-36 w-36 shrink-0">
                            {mounted && pieData.length > 0 && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <TxRow icon={<CheckCircle size={14} />} label="Completed" count={stats.transactions.completed} sum={stats.transactions.completedSum} color="text-emerald-400" dot="bg-emerald-500" />
                            <TxRow icon={<Clock size={14} />} label="Pending" count={stats.transactions.pending} sum={stats.transactions.pendingSum} color="text-amber-400" dot="bg-amber-500" />
                            <TxRow icon={<XCircle size={14} />} label="Failed" count={stats.transactions.failed} sum={stats.transactions.failedSum} color="text-red-400" dot="bg-red-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent orders + Review alert */}
            {stats.reviewCount > 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Orders pending review</p>
                        <p className="text-xs text-muted-foreground">{stats.reviewCount} order{stats.reviewCount > 1 ? "s" : ""} flagged for fraud review</p>
                    </div>
                </div>
            )}

            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="p-4 border-b"><h3 className="text-sm font-semibold flex items-center gap-2"><ShoppingBag size={14} className="text-muted-foreground" /> Recent Orders</h3></div>
                {stats.recentOrders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">No orders yet</div>
                ) : (
                    <div className="divide-y">
                        {stats.recentOrders.map((o) => (
                            <div key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0"><span className="text-xs font-bold text-muted-foreground">{o.userName[0]?.toUpperCase()}</span></span>
                                    <div className="min-w-0"><p className="text-sm font-medium truncate">{o.userName}</p><p className="text-[11px] text-muted-foreground truncate">{o.productName}</p></div>
                                </div>
                                <div className="text-right shrink-0"><p className="text-sm font-mono">{o.costPrx} PRX</p><p className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
    return (
        <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between mb-3"><span className="text-xs text-muted-foreground font-medium">{label}</span><span className="text-primary">{icon}</span></div>
            <p className="text-2xl font-mono font-semibold">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
        </div>
    );
}

function TxRow({ icon, label, count, sum, color, dot }: { icon: React.ReactNode; label: string; count: number; sum: number; color: string; dot: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            <span className={`${color} shrink-0`}>{icon}</span>
            <span className="text-sm flex-1">{label}</span>
            <div className="text-right">
                <span className="text-xs font-mono">{count}</span>
                <span className="text-[10px] text-muted-foreground ml-1">({sum.toLocaleString()} PRX)</span>
            </div>
        </div>
    );
}
