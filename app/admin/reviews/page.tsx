"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle, XCircle, Trash2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Review { id: string; rating: number; comment: string; approved: boolean; userName: string; userEmail: string; productName: string; createdAt: string }

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
    const [processing, setProcessing] = useState<string | null>(null);

    const load = () => { setLoading(true); fetch("/api/admin/reviews").then(r => r.json()).then(d => { if (d.ok) setReviews(d.reviews); }).finally(() => setLoading(false)); };
    useEffect(() => { load(); }, []);

    const approve = async (id: string) => { setProcessing(id); await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved: true }) }); toast.success("Approved"); load(); setProcessing(null); };
    const reject = async (id: string) => { setProcessing(id); await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved: false }) }); toast.success("Rejected"); load(); setProcessing(null); };
    const remove = async (id: string) => { if (!confirm("Delete this review?")) return; await fetch("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); toast.success("Deleted"); load(); };
    const massApprove = async () => {
        const ids = reviews.filter(r => !r.approved).map(r => r.id);
        if (ids.length === 0) { toast.info("No pending reviews"); return; }
        if (!confirm(`Approve all ${ids.length} pending reviews?`)) return;
        await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, approved: true }) });
        toast.success(`${ids.length} reviews approved`); load();
    };
    const massReject = async () => {
        const ids = reviews.filter(r => r.approved).map(r => r.id);
        if (ids.length === 0) return;
        if (!confirm(`Unapprove all ${ids.length} reviews?`)) return;
        await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, approved: false }) });
        toast.success(`${ids.length} reviews unapproved`); load();
    };

    const pendingCount = reviews.filter(r => !r.approved).length;
    const filtered = reviews.filter(r => filter === "all" || (filter === "pending" && !r.approved) || (filter === "approved" && r.approved));

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total Reviews</p><p className="text-2xl font-mono font-semibold">{reviews.length}</p></div>
                <div className={`rounded-lg border p-4 ${pendingCount > 0 ? "border-amber-500/20 bg-amber-500/5" : "bg-card"}`}><p className="text-xs text-muted-foreground mb-1">Pending</p><p className={`text-2xl font-mono font-semibold ${pendingCount > 0 ? "text-amber-400" : ""}`}>{pendingCount}</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Approved</p><p className="text-2xl font-mono font-semibold">{reviews.filter(r => r.approved).length}</p></div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1">
                    {(["all", "pending", "approved"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all cursor-pointer ${filter === f ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}>
                            {f === "all" ? "All" : f === "pending" ? `Pending (${pendingCount})` : "Approved"}
                        </button>
                    ))}
                </div>
                {pendingCount > 0 && (
                    <button onClick={massApprove} className="text-xs px-3 py-1.5 rounded-md border font-medium bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer transition-colors">
                        Approve All ({pendingCount})
                    </button>
                )}
            </div>

            {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div> : filtered.length === 0 ? (
                <div className="text-center py-12 border rounded-lg"><MessageSquare size={32} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No reviews</p></div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map(r => (
                        <div key={r.id} className={`rounded-lg border p-4 ${!r.approved ? "border-amber-500/20 bg-amber-500/5" : "bg-card"}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium">{r.userName}</span>
                                        <span className="text-[10px] text-muted-foreground">{r.userEmail}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{r.productName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"} />)}
                                    </div>
                                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                                    <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {!r.approved ? (
                                        <button onClick={() => approve(r.id)} disabled={processing === r.id} className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 h-7 px-2.5 gap-1 cursor-pointer disabled:opacity-50"><CheckCircle size={12} /> Approve</button>
                                    ) : (
                                        <button onClick={() => reject(r.id)} className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 h-7 px-2.5 gap-1 cursor-pointer"><XCircle size={12} /> Unapprove</button>
                                    )}
                                    <button onClick={() => remove(r.id)} className="inline-flex items-center justify-center rounded-md hover:bg-red-500/10 hover:text-red-400 size-7 cursor-pointer"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
