"use client";

import { useState, useEffect } from "react";
import { Plus, Package, Key, Search, ChevronDown, Loader2, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface StockItem { id: string; content: string; isSold: boolean }
interface Product { id: string; name: string; description: string; pricePrx: number; stockAvailable: number; stockTotal: number; totalSold: number; createdAt: string }

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [stockOpen, setStockOpen] = useState<string | null>(null);
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [expandedStock, setExpandedStock] = useState<StockItem[]>([]);
    const [expandedStockLoading, setExpandedStockLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", description: "", pricePrx: "" });
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const loadProducts = () => {
        setLoading(true);
        fetch("/api/admin/products").then((r) => r.json()).then((d) => { if (d.ok) setProducts(d.products); }).finally(() => setLoading(false));
    };

    useEffect(() => { loadProducts(); }, []);

    const startEdit = (p: Product) => {
        setEditingId(p.id);
        setEditForm({ name: p.name, description: p.description, pricePrx: String(p.pricePrx) });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingId, name: editForm.name, description: editForm.description, pricePrx: Number(editForm.pricePrx) }),
            });
            const data = await res.json();
            if (data.ok) { toast.success("Product updated"); loadProducts(); setEditingId(null); }
            else toast.error(data.error);
        } catch { toast.error("Network error"); }
        setSaving(false);
    };

    const deleteProduct = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch("/api/admin/products", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.ok) { toast.success("Product deleted"); loadProducts(); }
            else toast.error(data.error);
        } catch { toast.error("Network error"); }
    };

    const filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleExpand = async (id: string) => {
        if (expandedProduct === id) { setExpandedProduct(null); setExpandedStock([]); return; }
        setExpandedProduct(id); setExpandedStockLoading(true); setExpandedStock([]);
        try {
            const r = await fetch(`/api/admin/products/${id}/stock`);
            const d = await r.json();
            if (d.ok) setExpandedStock(d.stocks);
        } catch { /* ignore */ }
        setExpandedStockLoading(false);
    };

    return (
        <div className="flex flex-col gap-6">
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
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 border rounded-lg"><Package size={32} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No products found</p></div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((product) => {
                        const isExpanded = expandedProduct === product.id;
                        const isEditing = editingId === product.id;

                        return (
                            <div key={product.id} className="border rounded-lg bg-card overflow-hidden">
                                {isEditing ? (
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                                            <input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="Price" type="number" value={editForm.pricePrx} onChange={(e) => setEditForm({ ...editForm, pricePrx: e.target.value })} />
                                            <div className="flex gap-2">
                                                <button onClick={saveEdit} disabled={saving} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-3 gap-1.5 cursor-pointer hover:bg-primary/90 disabled:opacity-50 flex-1">
                                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="inline-flex items-center justify-center rounded-md text-sm border h-9 px-3 cursor-pointer hover:bg-accent">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <textarea className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring min-h-[60px] resize-none" placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                                    </div>
                                ) : (
                                    <div className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Package size={18} className="text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{product.name}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-4 shrink-0">
                                            <span className="font-mono text-sm">{product.pricePrx} PRX</span>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.stockAvailable > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                                                {product.stockAvailable} avail
                                            </span>
                                            <span className="text-xs text-muted-foreground">{product.totalSold} sold</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => startEdit(product)} className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground size-8 transition-all cursor-pointer" title="Edit"><Pencil size={14} /></button>
                                            <button onClick={() => setStockOpen(product.id)} className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground size-8 transition-all cursor-pointer" title="Add keys"><Key size={14} /></button>
                                            <button onClick={() => toggleExpand(product.id)} className={`inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground size-8 transition-all cursor-pointer ${isExpanded ? "bg-accent" : ""}`} title="View keys">
                                                <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                            </button>
                                            <button onClick={() => deleteProduct(product.id, product.name)} className="inline-flex items-center justify-center rounded-md hover:bg-red-500/10 hover:text-red-400 size-8 transition-all cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                )}

                                {isExpanded && (
                                    <div className="bg-muted/10 border-t px-4 py-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">STOCK KEYS ({product.stockTotal})</p>
                                        {expandedStockLoading ? (
                                            <div className="flex items-center justify-center py-4"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>
                                        ) : expandedStock.length === 0 ? (
                                            <p className="text-xs text-muted-foreground py-2">No keys added yet</p>
                                        ) : (
                                            <div className="grid gap-1.5 max-h-60 overflow-y-auto">
                                                {expandedStock.map((s) => (
                                                    <div key={s.id} className="flex items-center justify-between bg-background rounded-md px-3 py-2 border">
                                                        <code className="text-xs font-mono text-muted-foreground truncate">{s.content}</code>
                                                        <span className={`text-[10px] rounded-full px-2 py-0.5 shrink-0 ml-2 ${s.isSold ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>{s.isSold ? "sold" : "available"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

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
            if (data.ok) { toast.success("Product created"); onCreated(); onClose(); } else { setError(data.error || "Failed"); }
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
            if (data.ok) { toast.success(`${data.added} keys added`); onAdded(); onClose(); } else { setError(data.error || "Failed"); }
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
