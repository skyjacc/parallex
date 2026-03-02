"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, Eye, Loader2, CheckCircle, XCircle, Clock, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";

interface Order { id: string; userName: string; userEmail: string; productName: string; stockContent: string; costPrx: number; status: string; createdAt: string }

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    COMPLETED: { label: "Completed", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    REVIEW: { label: "Review", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
    REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "REVIEW" | "COMPLETED" | "REJECTED">("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    const loadOrders = () => { setLoading(true); fetch("/api/admin/orders").then((r) => r.json()).then((d) => { if (d.ok) setOrders(d.orders); }).finally(() => setLoading(false)); };
    useEffect(() => { loadOrders(); }, []);

    const handleReview = async (orderId: string, action: "approve" | "reject") => {
        setProcessing(orderId);
        try {
            const res = await fetch("/api/admin/orders/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, action }) });
            const data = await res.json();
            if (data.ok) { toast.success(action === "approve" ? "Order approved — key delivered" : `Order rejected — ${data.refunded} PRX refunded`); loadOrders(); setSelectedOrder(null); }
            else toast.error(data.error);
        } catch { toast.error("Network error"); }
        setProcessing(null);
    };

    const reviewCount = orders.filter((o) => o.status === "REVIEW").length;
    const filtered = orders
        .filter((o) => filter === "all" || o.status === filter)
        .filter((o) => o.userName.toLowerCase().includes(searchQuery.toLowerCase()) || o.productName.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const totalRevenue = orders.reduce((s, o) => s + o.costPrx, 0);

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total Orders</p><p className="text-2xl font-mono font-semibold">{orders.length}</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total Revenue</p><p className="text-2xl font-mono font-semibold">{totalRevenue.toLocaleString()} PRX</p></div>
                <div className={`rounded-lg border p-4 ${reviewCount > 0 ? "border-amber-500/20 bg-amber-500/5" : "bg-card"}`}>
                    <p className="text-xs text-muted-foreground mb-1">Pending Review</p>
                    <p className={`text-2xl font-mono font-semibold ${reviewCount > 0 ? "text-amber-400" : ""}`}>{reviewCount}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:max-w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input className="border-input flex h-9 w-full rounded-md border bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-1">
                    {(["all", "REVIEW", "COMPLETED", "REJECTED"] as const).map((f) => (
                        <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all cursor-pointer ${filter === f ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}>
                            {f === "all" ? "All" : f}
                            {f === "REVIEW" && reviewCount > 0 && <span className="ml-1.5 bg-amber-500 text-black text-[10px] px-1.5 rounded-full">{reviewCount}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div> : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b bg-muted/30"><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Order</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Product</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Amount</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th><th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th></tr></thead>
                        <tbody>
                            {filtered.map((order) => {
                                const cfg = statusConfig[order.status] || statusConfig.COMPLETED;
                                const Icon = cfg.icon;
                                return (
                                    <tr key={order.id} className="border-b hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3"><p className="text-sm font-medium">{order.userName}</p><p className="text-xs text-muted-foreground">{order.userEmail}</p></td>
                                        <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm">{order.productName}</span></td>
                                        <td className="px-4 py-3 hidden md:table-cell"><span className="font-mono text-sm">{order.costPrx} PRX</span></td>
                                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}><Icon size={12} />{cfg.label}</span></td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {order.status === "REVIEW" && (
                                                    <>
                                                        <button onClick={() => handleReview(order.id, "approve")} disabled={processing === order.id} className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 h-7 px-2.5 gap-1 cursor-pointer transition-colors disabled:opacity-50">
                                                            {processing === order.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Approve
                                                        </button>
                                                        <button onClick={() => handleReview(order.id, "reject")} disabled={processing === order.id} className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 h-7 px-2.5 gap-1 cursor-pointer transition-colors disabled:opacity-50">
                                                            <XCircle size={12} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => setSelectedOrder(order)} className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground size-7 transition-all cursor-pointer"><Eye size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12"><ShoppingBag size={32} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No orders found</p></div>}
                </div>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative z-50 bg-background border rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-6 border-b"><h2 className="text-lg font-semibold">Order Details</h2><code className="text-xs text-muted-foreground">{selectedOrder.id}</code></div>
                        <div className="p-6 flex flex-col gap-3 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{selectedOrder.userName}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedOrder.userEmail}</span></div>
                            <div className="h-px bg-border" />
                            <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium">{selectedOrder.productName}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono">{selectedOrder.costPrx} PRX</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${(statusConfig[selectedOrder.status] || statusConfig.COMPLETED).bg} ${(statusConfig[selectedOrder.status] || statusConfig.COMPLETED).color}`}>{selectedOrder.status}</span></div>
                            <div className="h-px bg-border" />
                            <div><span className="text-muted-foreground block mb-1.5">Key</span><code className="text-xs font-mono bg-muted/40 px-2 py-1 rounded block break-all">{selectedOrder.status === "REVIEW" ? "*** Under Review ***" : selectedOrder.stockContent}</code></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
                        </div>
                        <div className="p-6 border-t flex justify-between gap-3">
                            {selectedOrder.status === "REVIEW" && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleReview(selectedOrder.id, "approve")} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 h-9 px-4 gap-2 cursor-pointer"><CheckCircle size={14} /> Approve</button>
                                    <button onClick={() => handleReview(selectedOrder.id, "reject")} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 h-9 px-4 gap-2 cursor-pointer"><XCircle size={14} /> Reject</button>
                                </div>
                            )}
                            <button onClick={() => setSelectedOrder(null)} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent h-9 px-4 cursor-pointer ml-auto">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
