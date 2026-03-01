"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Package, Key, Search, ChevronDown, Edit2, Loader2 } from "lucide-react";

interface StockItem { id: string; content: string; isSold: boolean; }
interface Product { id: string; name: string; description: string; pricePrx: number; stock: StockItem[]; totalSold: number; createdAt: string; }

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [stockOpen, setStockOpen] = useState<string | null>(null);
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const loadProducts = () => {
        setLoading(true);
        fetch("/api/admin/products")
            .then((r) => r.json())
            .then((data) => { if (data.ok) setProducts(data.products); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadProducts(); }, []);

    const filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col gap-6">
            {/* Actions bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input className="border-input flex h-9 w-full rounded-md border bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <button onClick={() => setAddOpen(true)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 transition-all cursor-pointer gap-2 shrink-0">
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/30">
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Product</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Price</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Stock</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Sold</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((product) => {
                                const available = product.stock.filter((s) => !s.isSold).length;
                                const isExpanded = expandedProduct === product.id;
                                return (
                                    <tr key={product.id} className="group">
                                        <td colSpan={5} className="p-0">
                                            <div className="flex items-center border-b hover:bg-muted/20 transition-colors">
                                                <div className="flex-1 flex items-center gap-3 px-4 py-3">
                                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Package size={16} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-3 hidden sm:block"><span className="font-mono text-sm">{product.pricePrx} PRX</span></div>
                                                <div className="px-4 py-3 hidden md:block">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${available > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{available} available</span>
                                                </div>
                                                <div className="px-4 py-3 hidden lg:block"><span className="text-sm text-muted-foreground">{product.totalSold} sold</span></div>
                                                <div className="px-4 py-3 flex items-center gap-1 justify-end">
                                                    <button onClick={() => setStockOpen(product.id)} className="inline-flex items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground size-8 transition-all cursor-pointer" title="Add keys"><Key size={14} /></button>
                                                    <button onClick={() => setExpandedProduct(isExpanded ? null : product.id)} className={`inline-flex items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground size-8 transition-all cursor-pointer ${isExpanded ? "bg-accent" : ""}`} title="View keys">
                                                        <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                    </button>
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div className="bg-muted/10 border-b px-6 py-4">
                                                    <div className="flex items-center gap-2 mb-3"><Key size={14} className="text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground">STOCK KEYS ({product.stock.length})</span></div>
                                                    {product.stock.length === 0 ? (
                                                        <p className="text-xs text-muted-foreground py-2">No keys added yet</p>
                                                    ) : (
                                                        <div className="grid gap-1.5">
                                                            {product.stock.map((s) => (
                                                                <div key={s.id} className="flex items-center justify-between bg-background rounded-md px-3 py-2 border">
                                                                    <code className="text-xs font-mono text-muted-foreground">{s.content}</code>
                                                                    <span className={`text-xs rounded-full px-2 py-0.5 ${s.isSold ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>{s.isSold ? "sold" : "available"}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12"><Package size={32} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No products found</p></div>
                    )}
                </div>
            )}

            {/* Add Product Dialog */}
            {addOpen && <AddProductDialog onClose={() => setAddOpen(false)} onCreated={loadProducts} />}
            {stockOpen && <AddStockDialog productId={stockOpen} productName={products.find((p) => p.id === stockOpen)?.name || ""} onClose={() => setStockOpen(null)} onAdded={loadProducts} />}
        </div>
    );
}

function AddProductDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [price, setPrice] = useState(""); const [keys, setKeys] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState("");

    const handleCreate = async () => {
        setSaving(true); setError("");
        try {
            const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, pricePrx: Number(price), keys: keys.split("\n").filter((k) => k.trim()) }) });
            const data = await res.json();
            if (data.ok) { onCreated(); onClose(); } else { setError(data.error || "Failed"); }
        } catch { setError("Network error"); } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-50 bg-background border rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-hidden">
                <div className="p-6 border-b"><h2 className="text-lg font-semibold">Add New Product</h2></div>
                <div className="p-6 flex flex-col gap-4">
                    <div><label className="text-sm font-medium mb-1.5 block">Product Name</label><input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="Valorant PRX" value={name} onChange={(e) => setName(e.target.value)} /></div>
                    <div><label className="text-sm font-medium mb-1.5 block">Description</label><textarea className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring min-h-[80px] resize-none" placeholder="Premium aimbot + ESP..." value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                    <div><label className="text-sm font-medium mb-1.5 block">Price (PRX)</label><input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="350" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                    <div><label className="text-sm font-medium mb-1.5 block">Stock Keys <span className="text-muted-foreground font-normal">(one per line)</span></label><textarea className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring min-h-[100px] resize-none font-mono text-xs" placeholder={"KEY-XXXX-1111\nKEY-XXXX-2222"} value={keys} onChange={(e) => setKeys(e.target.value)} /></div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
                <div className="p-6 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent h-9 px-4 cursor-pointer">Cancel</button>
                    <button onClick={handleCreate} disabled={saving || !name || !price} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 cursor-pointer gap-2 disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddStockDialog({ productId, productName, onClose, onAdded }: { productId: string; productName: string; onClose: () => void; onAdded: () => void }) {
    const [keys, setKeys] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState("");

    const handleAdd = async () => {
        setSaving(true); setError("");
        try {
            const res = await fetch(`/api/admin/products/${productId}/stock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keys: keys.split("\n").filter((k) => k.trim()) }) });
            const data = await res.json();
            if (data.ok) { onAdded(); onClose(); } else { setError(data.error || "Failed"); }
        } catch { setError("Network error"); } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-50 bg-background border rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-hidden">
                <div className="p-6 border-b"><h2 className="text-lg font-semibold">Add Stock Keys</h2><p className="text-sm text-muted-foreground mt-1">Add keys to <strong>{productName}</strong></p></div>
                <div className="p-6"><textarea className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring min-h-[160px] resize-none font-mono text-xs" placeholder={"KEY-XXXX-1111\nKEY-XXXX-2222"} value={keys} onChange={(e) => setKeys(e.target.value)} />{error && <p className="text-sm text-red-400 mt-2">{error}</p>}</div>
                <div className="p-6 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent h-9 px-4 cursor-pointer">Cancel</button>
                    <button onClick={handleAdd} disabled={saving || !keys.trim()} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 cursor-pointer gap-2 disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />} Add Keys
                    </button>
                </div>
            </div>
        </div>
    );
}
