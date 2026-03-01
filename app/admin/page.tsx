"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from "recharts";

/* ── Mock data for charts ────────────────────────────────── */
const revenueData = [
    { name: "Mon", actual: 1200, previous: 800 },
    { name: "Tue", actual: 1800, previous: 1100 },
    { name: "Wed", actual: 1400, previous: 1300 },
    { name: "Thu", actual: 2200, previous: 1600 },
    { name: "Fri", actual: 2800, previous: 2000 },
    { name: "Sat", actual: 3200, previous: 2400 },
    { name: "Sun", actual: 2600, previous: 1900 },
];

const salesData = [
    { name: "Mon", sales: 4 },
    { name: "Tue", sales: 7 },
    { name: "Wed", sales: 5 },
    { name: "Thu", sales: 9 },
    { name: "Fri", sales: 12 },
    { name: "Sat", sales: 15 },
    { name: "Sun", sales: 10 },
];

const topProducts = [
    { name: "Valorant PRX", sales: 45 },
    { name: "Rust Dominator", sales: 38 },
    { name: "CS2 Lite", sales: 32 },
    { name: "Fortnite Evo", sales: 25 },
    { name: "Apex Phantom", sales: 18 },
];

const paymentSummary = [
    { name: "Completed", value: 8540, color: "oklch(92.47% 0.0524 66.1732)" },
    { name: "Pending", value: 1200, color: "oklch(76.99% 0 0)" },
    { name: "Failed", value: 340, color: "oklch(62.71% 0.1936 33.339)" },
];

/* ── Stats Cards ─────────────────────────────────────────── */
interface StatCardProps {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
    const isUp = change >= 0;
    return (
        <div className="flex flex-col w-full">
            <div className="bg-card text-card-foreground p-5 z-10 rounded-lg flex flex-col justify-between gap-3">
                <div className="flex flex-row justify-between gap-2">
                    <h3 className="text-sm flex items-center gap-2 tracking-tight text-muted-foreground font-medium">
                        {title}
                    </h3>
                    <div className="rounded-full text-muted-foreground/70">
                        {icon}
                    </div>
                </div>
                <div className="font-mono font-medium flex items-center gap-1 text-3xl">
                    {value}
                </div>
            </div>
            <div className="relative border border-card overflow-hidden rounded-b-lg -mt-4 p-2 pt-6">
                <div className="flex flex-row gap-2 text-xs items-center">
                    <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-xs ${
                            isUp
                                ? "bg-emerald-500/10 border border-emerald-500/10 text-emerald-500"
                                : "bg-red-500/10 border border-red-500/10 text-red-500"
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={isUp ? "" : "rotate-180"}
                        >
                            <path d="m18 15-6-6-6 6" />
                        </svg>
                        {Math.abs(change)}%
                    </span>
                    <span className="text-muted-foreground">since last period</span>
                </div>
            </div>
        </div>
    );
}

/* ── Tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-popover border rounded-lg px-3 py-2 shadow-lg text-sm">
            <p className="text-muted-foreground mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color }} className="font-mono font-medium">
                    {p.name}: {typeof p.value === "number" && p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}
                </p>
            ))}
        </div>
    );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function AdminOverview() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className="flex flex-col gap-8">
            {/* Stats row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Revenue"
                    value="$10,080"
                    change={12.5}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17 12 7l4 4 6-6" /><path d="M18 5h4v4" /></svg>
                    }
                />
                <StatCard
                    title="Sales"
                    value="62"
                    change={8.3}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    }
                />
                <StatCard
                    title="Customers"
                    value="24"
                    change={-3.2}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    }
                />
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border rounded-lg overflow-hidden bg-border">
                {/* Revenue chart */}
                <div className="flex flex-col gap-4 p-6 bg-background">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground gap-2 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17 12 7l4 4 6-6" /><path d="M18 5h4v4" /></svg>
                                Revenue
                            </div>
                            <div className="font-mono font-medium text-3xl flex items-center gap-1">
                                <span className="text-muted-foreground/70 font-normal">$</span>
                                10,080
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded bg-primary" />
                                <span className="text-muted-foreground/60">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded bg-muted" />
                                <span className="text-muted-foreground/60">Previous</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-60 w-full">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="oklch(92.47% 0.0524 66.1732)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="oklch(92.47% 0.0524 66.1732)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(25.2% 0 0)" />
                                    <XAxis dataKey="name" tick={{ fill: "oklch(76.99% 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "oklch(76.99% 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="previous" stroke="oklch(40% 0 0)" fill="oklch(25.2% 0 0)" fillOpacity={0.4} strokeWidth={2} name="Previous" />
                                    <Area type="monotone" dataKey="actual" stroke="oklch(92.47% 0.0524 66.1732)" fill="url(#colorActual)" strokeWidth={2} name="Actual" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Sales chart */}
                <div className="flex flex-col gap-4 p-6 bg-background">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground gap-2 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                                Sales
                            </div>
                            <div className="font-mono font-medium text-3xl">62</div>
                        </div>
                    </div>
                    <div className="h-60 w-full">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(25.2% 0 0)" />
                                    <XAxis dataKey="name" tick={{ fill: "oklch(76.99% 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "oklch(76.99% 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="sales" fill="oklch(92.47% 0.0524 66.1732)" radius={[4, 4, 0, 0]} name="Sales" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="flex flex-col justify-between gap-4 p-6 bg-background">
                    <div className="space-y-1">
                        <div className="flex items-center text-muted-foreground gap-2 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                            Top Products
                        </div>
                        <div className="font-mono font-medium text-3xl">
                            {topProducts.length}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {topProducts.map((p, i) => (
                            <div key={p.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                                    <span className="text-sm font-medium">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono">{p.sales}</span>
                                    <span className="text-xs text-muted-foreground">sales</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payments Summary */}
                <div className="flex flex-col justify-between gap-4 p-6 bg-background">
                    <div className="space-y-1">
                        <div className="flex items-center text-muted-foreground gap-2 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m16 12-4-4-4 4" /><path d="M12 16V8" /></svg>
                            Payments
                        </div>
                        <div className="font-mono font-medium text-3xl flex items-center gap-1">
                            <span className="text-muted-foreground/70 font-normal">$</span>
                            {paymentSummary.reduce((s, p) => s + p.value, 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="h-40 w-full flex items-center justify-center">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentSummary}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={4}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {paymentSummary.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground/60 mb-3">Payments Summary</div>
                        <ul className="text-sm divide-y divide-border">
                            {paymentSummary.map((p) => (
                                <li key={p.name} className="py-2 flex items-center gap-2">
                                    <span className="size-3 shrink-0 rounded" style={{ backgroundColor: p.color }} />
                                    <span className="grow text-muted-foreground">{p.name}</span>
                                    <span className="font-mono text-sm">
                                        <span className="text-muted-foreground/70">$</span>
                                        {p.value.toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
