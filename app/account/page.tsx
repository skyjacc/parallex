"use client";

import { useSession } from "next-auth/react";
import {
    User,
    Zap,
    ShoppingBag,
    Package,
    Shield,
    Calendar,
    Mail,
    Key,
    Clock,
} from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
    const { data: session } = useSession();
    const user = session?.user as any;

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-4xl w-full">
                <h1 className="text-2xl font-bold mb-1">Account</h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Your profile, balance, and purchase history — all in one place.
                </p>

                {/* ── Profile Card ── */}
                <div className="rounded-xl border bg-card overflow-hidden mb-6">
                    <div className="p-6 flex flex-col sm:flex-row gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-xl border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {user?.image ? (
                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-black text-muted-foreground">
                                    {user?.name?.[0]?.toUpperCase() || "?"}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-center gap-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
                                <span className="inline-flex items-center gap-1 text-[11px] border rounded-full px-2 py-0.5 font-medium">
                                    <Shield size={10} />
                                    {user?.role === "ADMIN" ? "Admin" : "User"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail size={14} />
                                    <span>{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={14} />
                                    <span>Joined February 2026</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Zap size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">PRX Balance</p>
                                <p className="text-xl font-bold">{user?.prxBalance?.toFixed(0) || "0"}</p>
                            </div>
                        </div>
                        <Link
                            href="/topup"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                            Top Up <Zap size={10} />
                        </Link>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ShoppingBag size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Orders</p>
                                <p className="text-xl font-bold">0</p>
                            </div>
                        </div>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                            Browse Shop <ShoppingBag size={10} />
                        </Link>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Key size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Active Keys</p>
                                <p className="text-xl font-bold">0</p>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">No active keys</span>
                    </div>
                </div>

                {/* ── Profile Details ── */}
                <div className="rounded-xl border bg-card p-6 mb-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <User size={16} />
                        Profile Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Username</label>
                            <input
                                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled
                                value={user?.name || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Email</label>
                            <input
                                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled
                                value={user?.email || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Role</label>
                            <input
                                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled
                                value={user?.role === "ADMIN" ? "Administrator" : "User"}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Account ID</label>
                            <input
                                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none disabled:opacity-60 disabled:cursor-not-allowed font-mono text-xs"
                                disabled
                                value={user?.id || ""}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Recent Orders ── */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="p-5 border-b flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Clock size={16} />
                            Recent Orders
                        </h3>
                        <Link href="/dashboard" className="text-xs text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="p-8 text-center">
                        <Package size={40} className="text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No orders yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Purchase a product and your keys will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
