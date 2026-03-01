"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Zap, Clock, ShoppingBag, User, Copy, Check, Loader2, Key, ArrowUpDown, CheckCircle, XCircle, AlertTriangle, Wallet } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Order {
    id: string;
    productName: string;
    key: string;
    costPrx: number;
    createdAt: string;
}

interface Transaction {
    id: string;
    amountPrx: number;
    status: "PENDING" | "COMPLETED" | "FAILED";
    type: "DEPOSIT" | "WITHDRAWAL";
    createdAt: string;
}

const statusConfig = {
    PENDING: { label: "Pending", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    COMPLETED: { label: "Completed", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    FAILED: { label: "Failed", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
};

export default function DashboardPage() {
    const { data: session } = useSession();
    const usr = session?.user as any;

    const [tab, setTab] = useState<"orders" | "topups">("orders");
    const [orders, setOrders] = useState<Order[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [loadingTx, setLoadingTx] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/orders").then((r) => r.json()).then((d) => { if (d.ok) setOrders(d.orders); }).finally(() => setLoadingOrders(false));
        fetch("/api/transactions").then((r) => r.json()).then((d) => { if (d.ok) setTransactions(d.transactions); }).finally(() => setLoadingTx(false));
    }, []);

    const copyKey = (id: string, key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        toast.success("Key copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const totalSpent = orders.reduce((s, o) => s + o.costPrx, 0);
    const totalDeposited = transactions.filter((t) => t.status === "COMPLETED").reduce((s, t) => s + t.amountPrx, 0);

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-4xl w-full">
                <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Manage your account, view orders, and check your PRX balance.
                </p>

                {/* User info */}
                <div className="rounded-xl border bg-card p-5 mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <User size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold">{usr?.name || "User"}</div>
                        <div className="text-sm text-muted-foreground">{usr?.email}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs border rounded-md px-2 py-1 font-medium">
                        {usr?.role === "ADMIN" ? "Admin" : "User"}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Zap size={18} className="text-primary" /></div>
                            <span className="text-sm text-muted-foreground">Balance</span>
                        </div>
                        <div className="text-2xl font-bold">{usr?.prxBalance?.toFixed(0) || "0"} <span className="text-sm font-normal text-muted-foreground">PRX</span></div>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><ShoppingBag size={18} className="text-primary" /></div>
                            <span className="text-sm text-muted-foreground">Orders</span>
                        </div>
                        <div className="text-2xl font-bold">{orders.length}</div>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Package size={18} className="text-primary" /></div>
                            <span className="text-sm text-muted-foreground">Spent</span>
                        </div>
                        <div className="text-2xl font-bold">{totalSpent.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">PRX</span></div>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Wallet size={18} className="text-emerald-400" /></div>
                            <span className="text-sm text-muted-foreground">Deposited</span>
                        </div>
                        <div className="text-2xl font-bold">{totalDeposited.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">PRX</span></div>
                    </div>
                </div>

                {/* Tab switch */}
                <div className="flex items-center gap-1 border-b mb-0">
                    <button
                        onClick={() => setTab("orders")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === "orders" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        <ShoppingBag size={14} /> Orders
                    </button>
                    <button
                        onClick={() => setTab("topups")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === "topups" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        <ArrowUpDown size={14} /> Top-Up History
                        {transactions.filter((t) => t.status === "PENDING").length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                    </button>
                </div>

                {/* ── Orders Tab ─────────────────────── */}
                {tab === "orders" && (
                    <div className="rounded-b-xl border border-t-0 bg-card">
                        {loadingOrders ? (
                            <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
                        ) : orders.length === 0 ? (
                            <div className="p-8 text-center">
                                <Package size={40} className="text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No orders yet</p>
                                <Link href="/shop" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 mt-4 transition-all cursor-pointer gap-2">
                                    <ShoppingBag size={14} /> Browse Shop
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {orders.map((order) => (
                                    <div key={order.id} className="p-4 hover:bg-muted/10 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{order.productName}</span>
                                            <span className="text-xs font-mono text-muted-foreground">{order.costPrx} PRX</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 flex items-center gap-2">
                                                <Key size={12} className="text-muted-foreground shrink-0" />
                                                <code className="text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded flex-1 break-all">{order.key}</code>
                                            </div>
                                            <button onClick={() => copyKey(order.id, order.key)} className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground size-7 transition-all cursor-pointer shrink-0">
                                                {copiedId === order.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <code className="text-[10px] text-muted-foreground/60">{order.id}</code>
                                            <span className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Top-Up History Tab ─────────────── */}
                {tab === "topups" && (
                    <div className="rounded-b-xl border border-t-0 bg-card">
                        {loadingTx ? (
                            <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
                        ) : transactions.length === 0 ? (
                            <div className="p-8 text-center">
                                <Wallet size={40} className="text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No top-ups yet</p>
                                <Link href="/topup" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 mt-4 transition-all cursor-pointer gap-2">
                                    <Zap size={14} /> Top Up PRX
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {transactions.map((tx) => {
                                    const cfg = statusConfig[tx.status];
                                    const Icon = cfg.icon;
                                    return (
                                        <div key={tx.id} className="p-4 hover:bg-muted/10 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                                                        <Icon size={16} className={cfg.color} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium flex items-center gap-2">
                                                            {tx.type === "DEPOSIT" ? "Top-Up" : "Withdrawal"}
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-medium`}>
                                                                {cfg.label}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-0.5">
                                                            {new Date(tx.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-mono font-medium ${tx.status === "COMPLETED" ? "text-emerald-400" : tx.status === "FAILED" ? "text-red-400" : "text-muted-foreground"}`}>
                                                        +{tx.amountPrx.toLocaleString()} PRX
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        ≈ ${(tx.amountPrx / 100).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
