"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Zap, Clock, ShoppingBag, User, Copy, Check, Loader2, Key } from "lucide-react";
import { useSession } from "next-auth/react";

interface Order {
    id: string;
    productName: string;
    key: string;
    costPrx: number;
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const usr = session?.user as any;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/orders")
            .then((r) => r.json())
            .then((data) => { if (data.ok) setOrders(data.orders); })
            .finally(() => setLoading(false));
    }, []);

    const copyKey = (id: string, key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const totalSpent = orders.reduce((s, o) => s + o.costPrx, 0);

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
                    <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs border rounded-md px-2 py-1 font-medium">
                            {usr?.role === "ADMIN" ? "Admin" : "User"}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Zap size={18} className="text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">PRX Balance</span>
                        </div>
                        <div className="text-2xl font-bold">
                            {usr?.prxBalance?.toFixed(0) || "0"} <span className="text-sm font-normal text-muted-foreground">PRX</span>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ShoppingBag size={18} className="text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">Total Orders</span>
                        </div>
                        <div className="text-2xl font-bold">{orders.length}</div>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Package size={18} className="text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">Total Spent</span>
                        </div>
                        <div className="text-2xl font-bold">{totalSpent.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">PRX</span></div>
                    </div>
                </div>

                {/* Orders */}
                <div className="rounded-xl border bg-card">
                    <div className="p-5 border-b">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Clock size={16} />
                            My Orders
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={24} className="animate-spin text-muted-foreground" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-8 text-center">
                            <Package size={40} className="text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No orders yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Your purchased keys will appear here</p>
                            <Link href="/shop" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 mt-4 transition-all cursor-pointer gap-2">
                                <ShoppingBag size={14} />
                                Browse Shop
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
                                            <code className="text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded flex-1 break-all">
                                                {order.key}
                                            </code>
                                        </div>
                                        <button
                                            onClick={() => copyKey(order.id, order.key)}
                                            className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground size-7 transition-all cursor-pointer shrink-0"
                                        >
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
            </div>
        </div>
    );
}
