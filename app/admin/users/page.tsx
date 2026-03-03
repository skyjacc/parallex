"use client";

import { useState, useEffect } from "react";
import { Search, Users, Shield, Zap, Loader2, Eye, UserCog, Save, CreditCard, AlertTriangle, Clock, ShoppingBag, ArrowUpRight, ArrowDownRight, Flag, X } from "lucide-react";
import { toast } from "sonner";

interface UserRow { id: string; name: string; email: string; role: string; prxBalance: number; ordersCount: number; createdAt: string }
interface TimelineEntry { type: "deposit" | "purchase"; description: string; amount: number; balanceBefore: number; balanceAfter: number; card?: string | null; status?: string; createdAt: string }
interface CardInfo { brand: string; last4: string; count: number; totalPrx: number }
interface UserDetail { user: UserRow & { flagged: boolean; discordId?: string | null; discordTag?: string | null }; timeline: TimelineEntry[]; cards: CardInfo[]; fraudRisk: boolean; totalDeposited: number; totalSpent: number }

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 50;
    const [detailId, setDetailId] = useState<string | null>(null);
    const [detail, setDetail] = useState<UserDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTab, setDetailTab] = useState<"activity" | "cards" | "edit">("activity");
    const [editRole, setEditRole] = useState("USER");
    const [editBalance, setEditBalance] = useState("");
    const [editDiscordId, setEditDiscordId] = useState("");
    const [editDiscordTag, setEditDiscordTag] = useState("");
    const [saving, setSaving] = useState(false);

    const loadUsers = (p = page) => { setLoading(true); fetch(`/api/admin/users?limit=${PAGE_SIZE}&offset=${p * PAGE_SIZE}`).then((r) => r.json()).then((d) => { if (d.ok) { setUsers(d.users); setTotal(d.total); } }).finally(() => setLoading(false)); };
    useEffect(() => { loadUsers(); }, []);
    useEffect(() => { loadUsers(page); }, [page]);

    const openDetail = async (id: string) => {
        setDetailId(id); setDetailLoading(true); setDetailTab("activity"); setDetail(null);
        try {
            const r = await fetch(`/api/admin/users/${id}`);
            const d = await r.json();
            if (d.ok) { setDetail(d); setEditRole(d.user.role); setEditBalance(String(d.user.prxBalance)); setEditDiscordId(d.user.discordId || ""); setEditDiscordTag(d.user.discordTag || ""); }
        } catch { /* ignore */ }
        setDetailLoading(false);
    };

    const saveUser = async () => {
        if (!detailId) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: detailId, role: editRole, prxBalance: Number(editBalance), discordId: editDiscordId, discordTag: editDiscordTag }) });
            const data = await res.json();
            if (data.ok) { toast.success("User updated"); loadUsers(page); openDetail(detailId); } else toast.error(data.error);
        } catch { toast.error("Network error"); }
        setSaving(false);
    };

    const flagUser = async () => {
        if (!detailId) return;
        try {
            const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: detailId, flagged: true }) });
            const data = await res.json();
            if (data.ok) { toast.success("User flagged"); openDetail(detailId); }
        } catch { /* ignore */ }
    };

    const unflagUser = async () => {
        if (!detailId) return;
        try {
            const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: detailId, flagged: false }) });
            const data = await res.json();
            if (data.ok) { toast.success("Flag removed"); openDetail(detailId); }
        } catch { /* ignore */ }
    };

    const filtered = users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const totalBalance = users.reduce((s, u) => s + u.prxBalance, 0);

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total Users</p><p className="text-2xl font-mono font-semibold">{total}</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">PRX in Circulation</p><p className="text-2xl font-mono font-semibold">{totalBalance.toLocaleString()}</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total Orders</p><p className="text-2xl font-mono font-semibold">{users.reduce((s, u) => s + u.ordersCount, 0)}</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Admins</p><p className="text-2xl font-mono font-semibold">{users.filter((u) => u.role === "ADMIN").length}</p></div>
            </div>

            <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="border-input flex h-9 w-full rounded-md border bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div> : (
                <>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b bg-muted/30"><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">User</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Role</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Balance</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Orders</th><th className="text-right text-xs font-medium text-muted-foreground px-4 py-3"></th></tr></thead>
                        <tbody>
                            {filtered.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => openDetail(user.id)}>
                                    <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0"><span className="text-xs font-bold text-muted-foreground">{user.name[0]?.toUpperCase()}</span></span><div><p className="text-sm font-medium flex items-center gap-1.5">{user.name}{user.role === "ADMIN" && <Shield size={12} className="text-primary" />}</p><p className="text-xs text-muted-foreground">{user.email}</p></div></div></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{user.role}</span></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><span className="font-mono text-sm flex items-center gap-1"><Zap size={12} className="text-primary" />{user.prxBalance.toLocaleString()}</span></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-muted-foreground">{user.ordersCount}</span></td>
                                    <td className="px-4 py-3 text-right"><Eye size={14} className="text-muted-foreground" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12"><Users size={32} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No users found</p></div>}
                </div>
                {total > PAGE_SIZE && (
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                        </span>
                        <div className="flex gap-2">
                            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent h-8 px-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Prev</button>
                            <button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage((p) => p + 1)} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent h-8 px-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                        </div>
                    </div>
                )}
                </>
            )}

            {/* Detail drawer */}
            {detailId && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailId(null)} />
                    <div className="relative z-50 bg-background border-l shadow-xl w-full max-w-xl h-full overflow-y-auto">
                        {detailLoading || !detail ? (
                            <div className="flex items-center justify-center h-full"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="sticky top-0 z-10 bg-background border-b p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><span className="text-lg font-bold text-muted-foreground">{detail.user.name[0]?.toUpperCase()}</span></span>
                                            <div>
                                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                                    {detail.user.name}
                                                    {detail.user.role === "ADMIN" && <Shield size={14} className="text-primary" />}
                                                    {detail.user.flagged && <Flag size={14} className="text-red-400" />}
                                                </h2>
                                                <p className="text-xs text-muted-foreground">{detail.user.email}</p>
                                                {detail.user.discordTag && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#5865F2]"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028z"/></svg>
                                                        {detail.user.discordTag}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => setDetailId(null)} className="rounded-md hover:bg-accent p-1.5 cursor-pointer"><X size={16} /></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        <div className="text-center"><p className="text-lg font-mono font-semibold">{detail.user.prxBalance.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Balance</p></div>
                                        <div className="text-center"><p className="text-lg font-mono font-semibold">{detail.totalDeposited.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Deposited</p></div>
                                        <div className="text-center"><p className="text-lg font-mono font-semibold">{detail.totalSpent.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Spent</p></div>
                                    </div>
                                    {detail.fraudRisk && (
                                        <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5 flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-red-400" />
                                            <span className="text-xs text-red-400 font-medium">Fraud Risk: {detail.cards.length} different cards used</span>
                                        </div>
                                    )}
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b">
                                    {(["activity", "cards", "edit"] as const).map((t) => (
                                        <button key={t} onClick={() => setDetailTab(t)} className={`flex-1 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${detailTab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                                            {t === "activity" ? "Activity" : t === "cards" ? `Cards (${detail.cards.length})` : "Edit"}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-5">
                                    {/* Activity timeline */}
                                    {detailTab === "activity" && (
                                        <div className="flex flex-col gap-0">
                                            {detail.timeline.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
                                            ) : detail.timeline.map((e, i) => (
                                                <div key={i} className="flex gap-3 pb-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${e.type === "deposit" ? "bg-emerald-500/10" : "bg-primary/10"}`}>
                                                            {e.type === "deposit" ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-primary" />}
                                                        </div>
                                                        {i < detail.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pb-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium">{e.type === "deposit" ? "Deposit" : e.description}</p>
                                                            <span className={`text-sm font-mono ${e.amount > 0 ? "text-emerald-400" : "text-foreground"}`}>
                                                                {e.amount > 0 ? "+" : ""}{e.amount.toLocaleString()} PRX
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-muted-foreground font-mono">{e.balanceBefore.toLocaleString()} → {e.balanceAfter.toLocaleString()} PRX</span>
                                                            {e.card && <span className="text-[10px] text-muted-foreground font-mono">{e.card}</span>}
                                                            {e.status === "REVIEW" && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 rounded">review</span>}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{new Date(e.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Cards tab */}
                                    {detailTab === "cards" && (
                                        <div className="flex flex-col gap-3">
                                            {detail.cards.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-8">No cards on file</p>
                                            ) : detail.cards.map((c) => (
                                                <div key={`${c.brand}_${c.last4}`} className="rounded-lg border p-4 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                        <CreditCard size={18} className="text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium font-mono">{c.brand} **** {c.last4}</p>
                                                        <p className="text-xs text-muted-foreground">{c.count} transaction{c.count > 1 ? "s" : ""} · {c.totalPrx.toLocaleString()} PRX total</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {detail.user.flagged ? (
                                                <button onClick={unflagUser} className="mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 h-9 px-4 gap-2 cursor-pointer transition-colors">
                                                    <Shield size={14} /> Remove Flag
                                                </button>
                                            ) : (
                                                <button onClick={flagUser} className="mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 h-9 px-4 gap-2 cursor-pointer transition-colors">
                                                    <Flag size={14} /> Flag as Suspicious
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Edit tab */}
                                    {detailTab === "edit" && (
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <label className="text-sm font-medium mb-1.5 block">Role</label>
                                                <div className="flex gap-2">
                                                    {(["USER", "SUPPORT", "ADMIN"] as const).map((r) => (
                                                        <button key={r} onClick={() => setEditRole(r)} className={`flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 cursor-pointer transition-all border ${editRole === r ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>
                                                            {r === "ADMIN" && <Shield size={14} className="mr-1.5" />}{r}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1.5 block">PRX Balance</label>
                                                <div className="relative">
                                                    <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                                                    <input className="border-input flex h-9 w-full rounded-md border bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring font-mono" type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="h-px bg-border" />
                                            <div>
                                                <label className="text-sm font-medium mb-1.5 block">Discord ID</label>
                                                <input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring font-mono" placeholder="123456789012345678" value={editDiscordId} onChange={(e) => setEditDiscordId(e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1.5 block">Discord Tag</label>
                                                <input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="username#0001 or username" value={editDiscordTag} onChange={(e) => setEditDiscordTag(e.target.value)} />
                                            </div>
                                            {detail.user.discordId && (
                                                <a href={`https://discord.com/users/${detail.user.discordId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Open Discord Profile</a>
                                            )}
                                            <div className="h-px bg-border" />
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>User ID</span><code className="text-xs font-mono bg-muted/40 px-1.5 py-0.5 rounded">{detail.user.id}</code>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>Joined</span><span>{new Date(detail.user.createdAt).toLocaleString()}</span>
                                            </div>
                                            <button onClick={saveUser} disabled={saving} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 cursor-pointer gap-2 disabled:opacity-50 mt-2">
                                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
