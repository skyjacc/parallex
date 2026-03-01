"use client";

import { useState, useEffect } from "react";
import { Search, Users, Shield, Zap, Ban, Eye, Loader2 } from "lucide-react";

interface UserRow { id: string; name: string; email: string; role: string; prxBalance: number; ordersCount: number; createdAt: string; }

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

    useEffect(() => {
        fetch("/api/admin/users")
            .then((r) => r.json())
            .then((data) => { if (data.ok) setUsers(data.users); })
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const totalBalance = users.reduce((s, u) => s + u.prxBalance, 0);

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total Users</p><p className="text-2xl font-mono font-semibold">{users.length}</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total PRX in Circulation</p><p className="text-2xl font-mono font-semibold">{totalBalance.toLocaleString()}</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Admins</p><p className="text-2xl font-mono font-semibold">{users.filter((u) => u.role === "ADMIN").length}</p></div>
            </div>

            <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="border-input flex h-9 w-full rounded-md border bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b bg-muted/30"><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">User</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Role</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">PRX Balance</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Orders</th><th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Joined</th><th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th></tr></thead>
                        <tbody>
                            {filtered.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0"><span className="text-xs font-bold text-muted-foreground">{user.name[0]?.toUpperCase()}</span></span>
                                            <div><p className="text-sm font-medium flex items-center gap-1.5">{user.name}{user.role === "ADMIN" && <Shield size={12} className="text-primary" />}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{user.role}</span></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><span className="font-mono text-sm flex items-center gap-1"><Zap size={12} className="text-primary" />{user.prxBalance.toLocaleString()}</span></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-muted-foreground">{user.ordersCount}</span></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</span></td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setSelectedUser(user)} className="inline-flex items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground size-8 transition-all cursor-pointer"><Eye size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12"><Users size={32} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No users found</p></div>}
                </div>
            )}

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                    <div className="relative z-50 bg-background border rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-6 border-b flex items-center gap-3">
                            <span className="w-10 h-10 rounded-md bg-muted flex items-center justify-center"><span className="text-sm font-bold text-muted-foreground">{selectedUser.name[0]?.toUpperCase()}</span></span>
                            <div><h2 className="text-lg font-semibold flex items-center gap-2">{selectedUser.name}{selectedUser.role === "ADMIN" && <Shield size={16} className="text-primary" />}</h2><p className="text-xs text-muted-foreground">{selectedUser.email}</p></div>
                        </div>
                        <div className="p-6 flex flex-col gap-4 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><code className="text-xs font-mono bg-muted/40 px-1.5 py-0.5 rounded">{selectedUser.id.slice(0, 16)}...</code></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${selectedUser.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{selectedUser.role}</span></div>
                            <div className="h-px bg-border" />
                            <div className="flex justify-between"><span className="text-muted-foreground">PRX Balance</span><span className="font-mono flex items-center gap-1"><Zap size={14} className="text-primary" />{selectedUser.prxBalance.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Total Orders</span><span className="font-mono">{selectedUser.ordersCount}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span></div>
                        </div>
                        <div className="p-6 border-t flex justify-end"><button onClick={() => setSelectedUser(null)} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent h-9 px-4 cursor-pointer">Close</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
