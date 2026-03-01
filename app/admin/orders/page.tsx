"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface Order { id: string; userName: string; userEmail: string; productName: string; stockContent: string; costPrx: number; createdAt: string; }

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetch("/api/admin/orders")
            .then((r) => r.json())
            .then((data) => { if (data.ok) setOrders(data.orders); })
            .finally(() => setLoading(false));
    }, []);

    const filtered = orders.filter((o) =>
        o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalRevenue = orders.reduce((s, o) => s + o.costPrx, 0);

    return (
        <div className="flex flex-col gap-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total Orders</p><p className="text-2xl font-mono font-semibold">{orders.length}</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total Revenue</p><p className="text-2xl font-mono font-semibold">{totalRevenue.toLocaleString()} PRX</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Unique Customers</p><p className="text-2xl font-mono font-semibold">{new Set(orders.map((o) => o.userEmail)).size}</p></div>
            </div>

            <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="border-input flex h-9 w-full rounded-md border bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b bg-muted/30"><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Order ID</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Customer</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Product</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Amount</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Date</th><th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th></tr></thead>
                        <tbody>
                            {filtered.map((order) => (
                                <tr key={order.id} className="border-b hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3"><code className="text-xs font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">{order.id.slice(0, 12)}...</code></td>
                                    <td className="px-4 py-3"><p className="text-sm font-medium">{order.userName}</p><p className="text-xs text-muted-foreground">{order.userEmail}</p></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm">{order.productName}</span></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><span className="font-mono text-sm">{order.costPrx} PRX</span></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span></td>
                                    <td className="px-4 py-3 text-right"><button onClick={() => setSelectedOrder(order)} className="inline-flex items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground size-8 transition-all cursor-pointer"><Eye size={14} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12"><ShoppingBag size={32} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">{orders.length === 0 ? "No orders yet" : "No orders found"}</p></div>}
                </div>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative z-50 bg-background border rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-6 border-b"><h2 className="text-lg font-semibold">Order Details</h2><code className="text-xs text-muted-foreground">{selectedOrder.id}</code></div>
                        <div className="p-6 flex flex-col gap-4 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{selectedOrder.userName}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedOrder.userEmail}</span></div>
                            <div className="h-px bg-border" />
                            <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium">{selectedOrder.productName}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono">{selectedOrder.costPrx} PRX</span></div>
                            <div className="h-px bg-border" />
                            <div><span className="text-muted-foreground block mb-1.5">Key Delivered</span><code className="text-xs font-mono bg-muted/40 px-2 py-1 rounded block break-all">{selectedOrder.stockContent}</code></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
                        </div>
                        <div className="p-6 border-t flex justify-end"><button onClick={() => setSelectedOrder(null)} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent h-9 px-4 cursor-pointer">Close</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
