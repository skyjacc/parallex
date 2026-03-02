"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Tag, Percent } from "lucide-react";
import { toast } from "sonner";

interface Coupon { id: string; code: string; discountPercent: number | null; discountFixed: number | null; maxUses: number; usedCount: number; expiresAt: string | null; active: boolean; createdAt: string }

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [code, setCode] = useState(""); const [discType, setDiscType] = useState<"percent" | "fixed">("percent"); const [discValue, setDiscValue] = useState(""); const [maxUses, setMaxUses] = useState(""); const [expiry, setExpiry] = useState(""); const [saving, setSaving] = useState(false);

    const load = () => { setLoading(true); fetch("/api/admin/coupons").then(r => r.json()).then(d => { if (d.ok) setCoupons(d.coupons); }).finally(() => setLoading(false)); };
    useEffect(() => { load(); }, []);

    const create = async () => {
        setSaving(true);
        try {
            const body: any = { code, maxUses: Number(maxUses) || 0, expiresAt: expiry || null };
            if (discType === "percent") body.discountPercent = Number(discValue);
            else body.discountFixed = Number(discValue);
            const r = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const d = await r.json();
            if (d.ok) { toast.success("Coupon created"); load(); setAddOpen(false); setCode(""); setDiscValue(""); }
            else toast.error(d.error);
        } catch { toast.error("Failed"); }
        setSaving(false);
    };

    const remove = async (id: string) => {
        if (!confirm("Delete this coupon?")) return;
        await fetch("/api/admin/coupons", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        toast.success("Deleted"); load();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-semibold">Coupons</h2><p className="text-xs text-muted-foreground">Create and manage promo codes</p></div>
                <button onClick={() => setAddOpen(true)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 cursor-pointer gap-2"><Plus size={16} /> Create Coupon</button>
            </div>

            {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div> : coupons.length === 0 ? (
                <div className="text-center py-12 border rounded-lg"><Tag size={32} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No coupons yet</p></div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b bg-muted/30"><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Code</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Discount</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Uses</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Expires</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th><th className="text-right text-xs font-medium text-muted-foreground px-4 py-3"></th></tr></thead>
                        <tbody>{coupons.map(c => (
                            <tr key={c.id} className="border-b hover:bg-muted/10">
                                <td className="px-4 py-3"><code className="text-sm font-mono font-medium">{c.code}</code></td>
                                <td className="px-4 py-3 text-sm">{c.discountPercent ? `${c.discountPercent}%` : c.discountFixed ? `${c.discountFixed} PRX` : "—"}</td>
                                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{c.usedCount}/{c.maxUses || "∞"}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{c.active ? "Active" : "Inactive"}</span></td>
                                <td className="px-4 py-3 text-right"><button onClick={() => remove(c.id)} className="inline-flex items-center justify-center rounded-md hover:bg-red-500/10 hover:text-red-400 size-7 cursor-pointer"><Trash2 size={14} /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {addOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
                    <div className="relative z-50 bg-background border rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-6 border-b"><h2 className="text-lg font-semibold">Create Coupon</h2></div>
                        <div className="p-6 flex flex-col gap-4">
                            <div><label className="text-sm font-medium mb-1.5 block">Code</label><input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring font-mono uppercase" placeholder="WELCOME10" value={code} onChange={e => setCode(e.target.value)} /></div>
                            <div><label className="text-sm font-medium mb-1.5 block">Discount Type</label><div className="flex gap-2">{(["percent", "fixed"] as const).map(t => (<button key={t} onClick={() => setDiscType(t)} className={`flex-1 h-9 rounded-md text-sm font-medium border cursor-pointer transition-all ${discType === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}>{t === "percent" ? "% Off" : "Fixed PRX"}</button>))}</div></div>
                            <div><label className="text-sm font-medium mb-1.5 block">{discType === "percent" ? "Percentage" : "PRX Amount"}</label><input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" type="number" placeholder={discType === "percent" ? "10" : "500"} value={discValue} onChange={e => setDiscValue(e.target.value)} /></div>
                            <div><label className="text-sm font-medium mb-1.5 block">Max Uses (0 = unlimited)</label><input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" type="number" placeholder="100" value={maxUses} onChange={e => setMaxUses(e.target.value)} /></div>
                            <div><label className="text-sm font-medium mb-1.5 block">Expiry Date (optional)</label><input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} /></div>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button onClick={() => setAddOpen(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent h-9 px-4 cursor-pointer">Cancel</button>
                            <button onClick={create} disabled={saving || !code || !discValue} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 cursor-pointer gap-2 disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
