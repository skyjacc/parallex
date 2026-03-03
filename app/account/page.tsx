"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { User, Key, FileText, ShoppingBag, Wallet, Users, Zap, Shield, Calendar, Mail, Loader2, Copy, Check, Clock, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, Gift, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Tab = "account" | "password" | "invoices" | "orders" | "balances" | "referrers";

interface Transaction { id: string; amountPrx: number; status: string; type: string; cardLast4?: string; cardBrand?: string; createdAt: string }
interface Order { id: string; productName: string; key: string | null; status: string; costPrx: number; createdAt: string }
interface BalLog { id: string; type: string; amount: number; description: string; balanceBefore: number; balanceAfter: number; createdAt: string }
interface Ref { userName: string; bonus: number; date: string }
interface RefData { referralCode: string; referralLink: string; totalReferrals: number; totalBonus: number; referrals: Ref[] }

export default function AccountPage() {
    const { data: session } = useSession();
    const usr = session?.user as any;
    const [tab, setTab] = useState<Tab>("account");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [discordTag, setDiscordTag] = useState("");
    const [discordSaving, setDiscordSaving] = useState(false);
    const [accountLoaded, setAccountLoaded] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [balLogs, setBalLogs] = useState<BalLog[]>([]);
    const [refData, setRefData] = useState<RefData | null>(null);
    const [loading, setLoading] = useState(false);
    const [orderCount, setOrderCount] = useState<number | null>(null);
    const [curPw, setCurPw] = useState(""); const [newPw, setNewPw] = useState(""); const [confirmPw, setConfirmPw] = useState(""); const [pwSaving, setPwSaving] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [copiedRef, setCopiedRef] = useState(false);

    useEffect(() => {
        // Always fetch order count for the account tab
        fetch("/api/orders").then(r => r.json()).then(d => { if (d.ok) { setOrders(d.orders); setOrderCount(d.orders.length); } });
    }, []);

    useEffect(() => {
        if (!accountLoaded) { fetch("/api/account").then(r => r.json()).then(d => { if (d.ok && d.user) { setDiscordTag(d.user.discordTag || ""); } }).finally(() => setAccountLoaded(true)); }
        if (tab === "invoices" && transactions.length === 0) { setLoading(true); fetch("/api/transactions").then(r => r.json()).then(d => { if (d.ok) setTransactions(d.transactions); }).finally(() => setLoading(false)); }
        if (tab === "orders" && orders.length === 0) { setLoading(true); fetch("/api/orders").then(r => r.json()).then(d => { if (d.ok) { setOrders(d.orders); setOrderCount(d.orders.length); } }).finally(() => setLoading(false)); }
        if (tab === "balances" && balLogs.length === 0) { setLoading(true); fetch("/api/balance-logs").then(r => r.json()).then(d => { if (d.ok) setBalLogs(d.logs); }).finally(() => setLoading(false)); }
        if (tab === "referrers" && !refData) { setLoading(true); fetch("/api/referral").then(r => r.json()).then(d => { if (d.ok) setRefData(d); }).finally(() => setLoading(false)); }
    }, [tab]);

    const changePw = async () => {
        if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
        setPwSaving(true);
        try {
            const r = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }) });
            const d = await r.json();
            if (d.ok) { toast.success("Password changed"); setCurPw(""); setNewPw(""); setConfirmPw(""); } else toast.error(d.error);
        } catch { toast.error("Failed"); }
        setPwSaving(false);
    };

    const copyKey = (id: string, key: string) => { navigator.clipboard.writeText(key); setCopiedId(id); toast.success("Copied"); setTimeout(() => setCopiedId(null), 2000); };
    const copyRefLink = () => { if (refData) { navigator.clipboard.writeText(refData.referralLink); setCopiedRef(true); toast.success("Copied"); setTimeout(() => setCopiedRef(false), 2000); } };

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: "account", label: "Account", icon: User },
        { id: "password", label: "Password", icon: Lock },
        { id: "invoices", label: "Invoices", icon: FileText },
        { id: "orders", label: "Orders", icon: ShoppingBag },
        { id: "balances", label: "Balances", icon: Wallet },
        { id: "referrers", label: "Referrers", icon: Users },
    ];

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-4xl w-full">
                <h1 className="text-2xl font-bold mb-1">Account</h1>
                <p className="text-sm text-muted-foreground mb-6">Manage your account settings and view history.</p>

                <div className="flex gap-1 border-b mb-6 overflow-x-auto">
                    {tabs.map((t) => { const I = t.icon; return (
                        <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                            <I size={14} />{t.label}
                        </button>
                    ); })}
                </div>

                {/* Account Tab */}
                {tab === "account" && (
                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border bg-card p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center"><span className="text-2xl font-black text-muted-foreground">{usr?.name?.[0]?.toUpperCase() || "?"}</span></div>
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">{usr?.name} <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium">{usr?.role}</span></h2>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail size={12} />{usr?.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="rounded-xl border bg-card p-5"><div className="flex items-center gap-2 mb-2"><Zap size={16} className="text-primary" /><span className="text-xs text-muted-foreground">Balance</span></div><p className="text-2xl font-mono font-bold">{usr?.prxBalance || 0} <span className="text-sm font-normal text-muted-foreground">PRX</span></p></div>
                            <div className="rounded-xl border bg-card p-5"><div className="flex items-center gap-2 mb-2"><ShoppingBag size={16} className="text-primary" /><span className="text-xs text-muted-foreground">Orders</span></div><p className="text-2xl font-mono font-bold">{orderCount !== null ? orderCount : "—"}</p></div>
                            <div className="rounded-xl border bg-card p-5"><div className="flex items-center gap-2 mb-2"><Calendar size={16} className="text-primary" /><span className="text-xs text-muted-foreground">Joined</span></div><p className="text-sm font-medium">Member since registration</p></div>
                        </div>

                        {/* Discord connection */}
                        <div className="rounded-xl border bg-card p-5">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#5865F2]"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028z"/></svg>
                                Discord
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">Link your Discord for faster support and updates.</p>
                            <div className="flex gap-2">
                                <input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="username or username#0001" value={discordTag} onChange={(e) => setDiscordTag(e.target.value)} />
                                <button
                                    onClick={async () => { setDiscordSaving(true); try { const r = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ discordTag }) }); const d = await r.json(); if (d.ok) toast.success("Discord saved"); } catch {} setDiscordSaving(false); }}
                                    disabled={discordSaving}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#5865F2] text-white h-9 px-4 cursor-pointer gap-2 hover:bg-[#4752C4] disabled:opacity-50 shrink-0"
                                >
                                    {discordSaving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Tab */}
                {tab === "password" && (
                    <div className="max-w-md">
                        <h2 className="text-lg font-semibold mb-1">Change Password</h2>
                        <p className="text-sm text-muted-foreground mb-6">Make sure it&apos;s secure!</p>
                        <div className="flex flex-col gap-4">
                            <div><label className="text-sm font-medium mb-1.5 block">Current Password</label><input type="password" className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" value={curPw} onChange={e => setCurPw(e.target.value)} /></div>
                            <div><label className="text-sm font-medium mb-1.5 block">New Password</label><input type="password" className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" value={newPw} onChange={e => setNewPw(e.target.value)} /></div>
                            <div><label className="text-sm font-medium mb-1.5 block">Confirm Password</label><input type="password" className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} /></div>
                            <button onClick={changePw} disabled={pwSaving || !curPw || !newPw} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 cursor-pointer gap-2 disabled:opacity-50 w-fit">
                                {pwSaving ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />} Change Password
                            </button>
                        </div>
                    </div>
                )}

                {/* Invoices Tab */}
                {tab === "invoices" && (
                    <div className="border rounded-lg overflow-hidden">
                        {loading ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div> : transactions.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">No invoices yet. <Link href="/topup" className="text-primary hover:underline">Top up PRX</Link></div>
                        ) : (
                            <table className="w-full">
                                <thead><tr className="border-b bg-muted/30"><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">ID</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Card</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Amount</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th></tr></thead>
                                <tbody>{transactions.map(t => (
                                    <tr key={t.id} className="border-b hover:bg-muted/10"><td className="px-4 py-3"><code className="text-[10px] font-mono text-muted-foreground">{t.id.slice(0, 16)}...</code></td><td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td><td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{t.cardLast4 ? `${t.cardBrand} ****${t.cardLast4}` : "—"}</td><td className="px-4 py-3 text-sm font-mono">{t.amountPrx} PRX</td><td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" : t.status === "PENDING" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>{t.status.toLowerCase()}</span></td></tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {tab === "orders" && (
                    <div className="border rounded-lg overflow-hidden">
                        {loading ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div> : orders.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">No orders yet. <Link href="/shop" className="text-primary hover:underline">Browse shop</Link></div>
                        ) : (
                            <table className="w-full">
                                <thead><tr className="border-b bg-muted/30"><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Product</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Price</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Date</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th><th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Key</th></tr></thead>
                                <tbody>{orders.map(o => (
                                    <tr key={o.id} className="border-b hover:bg-muted/10"><td className="px-4 py-3 text-sm font-medium">{o.productName}</td><td className="px-4 py-3 text-sm font-mono">{o.costPrx} PRX</td><td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{new Date(o.createdAt).toLocaleDateString()}</td><td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${o.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" : o.status === "REVIEW" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>{o.status.toLowerCase()}</span></td><td className="px-4 py-3 text-right">{o.key ? <button onClick={() => copyKey(o.id, o.key!)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">{copiedId === o.id ? <Check size={12} /> : <Copy size={12} />}{copiedId === o.id ? "Copied" : "Copy key"}</button> : <span className="text-[10px] text-muted-foreground">{o.status === "REVIEW" ? "Under review" : "—"}</span>}</td></tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Balances Tab */}
                {tab === "balances" && (
                    <div className="border rounded-lg overflow-hidden">
                        {loading ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div> : balLogs.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">No balance activity yet</div>
                        ) : (
                            <div className="divide-y">
                                {balLogs.map(l => (
                                    <div key={l.id} className="px-4 py-3 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${l.amount > 0 ? "bg-emerald-500/10" : "bg-primary/10"}`}>
                                            {l.amount > 0 ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-primary" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{l.type.replace(/_/g, " ")}</p>
                                            <p className="text-[10px] text-muted-foreground">{l.description} · {new Date(l.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-sm font-mono ${l.amount > 0 ? "text-emerald-400" : ""}`}>{l.amount > 0 ? "+" : ""}{l.amount} PRX</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">{l.balanceBefore} → {l.balanceAfter}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Referrers Tab */}
                {tab === "referrers" && (
                    <div>
                        {loading ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div> : !refData ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">Failed to load</div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-mono font-bold">{refData.totalReferrals}</p><p className="text-xs text-muted-foreground">Referrals</p></div>
                                    <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-mono font-bold">{refData.totalBonus}</p><p className="text-xs text-muted-foreground">PRX Earned</p></div>
                                    <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-mono font-bold">10%</p><p className="text-xs text-muted-foreground">Commission</p></div>
                                </div>
                                <div className="rounded-xl border bg-card p-5">
                                    <label className="text-sm font-medium mb-2 block">Your Referral Link</label>
                                    <div className="flex gap-2"><code className="flex-1 bg-muted/30 border rounded-lg px-3 py-2 font-mono text-xs break-all">{refData.referralLink}</code><button onClick={copyRefLink} className="inline-flex items-center justify-center rounded-md border hover:bg-accent size-9 shrink-0 cursor-pointer">{copiedRef ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}</button></div>
                                </div>
                                {refData.referrals.length > 0 && (
                                    <div className="border rounded-lg divide-y">{refData.referrals.map((r, i) => (
                                        <div key={i} className="px-4 py-3 flex items-center justify-between"><div><p className="text-sm font-medium">{r.userName}</p><p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</p></div><span className="text-sm font-mono text-emerald-400">+{r.bonus} PRX</span></div>
                                    ))}</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
