"use client";

import { useEffect, useState } from "react";
import { Zap, Globe, Key, Shield, CreditCard, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethod {
    id: string;
    code: string;
    name: string;
    description: string;
    enabled: boolean;
    sortOrder: number;
}

export default function AdminSettingsPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/payment-methods")
            .then((r) => r.json())
            .then((data) => { if (data.ok) setMethods(data.methods); })
            .finally(() => setLoadingMethods(false));
    }, []);

    const toggleMethod = async (id: string, enabled: boolean) => {
        setTogglingId(id);
        try {
            const res = await fetch("/api/admin/payment-methods", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, enabled }),
            });
            const data = await res.json();
            if (data.ok) {
                setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, enabled } : m)));
                toast.success(`${data.method.name} ${enabled ? "enabled" : "disabled"}`);
            } else {
                toast.error(data.error || "Failed to update");
            }
        } catch {
            toast.error("Network error");
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-8 max-w-2xl">
            {/* Payment Methods */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="p-5 border-b">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <CreditCard size={16} className="text-primary" />
                        Payment Methods
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Enable or disable payment methods. Disabled methods appear grayed out in the store.
                    </p>
                </div>
                <div className="divide-y">
                    {loadingMethods ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={20} className="animate-spin text-muted-foreground" />
                        </div>
                    ) : methods.length === 0 ? (
                        <div className="p-5 text-sm text-muted-foreground text-center">
                            No payment methods configured. Run seed to add defaults.
                        </div>
                    ) : (
                        methods.map((method) => (
                            <div key={method.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${method.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                        {method.code.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${!method.enabled ? "text-muted-foreground" : ""}`}>
                                            {method.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{method.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${method.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                        {method.enabled ? "Active" : "Disabled"}
                                    </span>
                                    <button
                                        onClick={() => toggleMethod(method.id, !method.enabled)}
                                        disabled={togglingId === method.id}
                                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${method.enabled ? "bg-primary" : "bg-muted"}`}
                                    >
                                        {togglingId === method.id ? (
                                            <Loader2 size={12} className="absolute top-1.5 left-1/2 -translate-x-1/2 animate-spin" />
                                        ) : (
                                            <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${method.enabled ? "right-1 bg-primary-foreground" : "left-1 bg-foreground"}`} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* General */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="p-5 border-b">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Globe size={16} className="text-muted-foreground" />
                        General
                    </h3>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Store Name</label>
                        <input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" defaultValue="Parallax" />
                    </div>
                </div>
            </div>

            {/* PRX Configuration */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="p-5 border-b">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Zap size={16} className="text-primary" />
                        PRX Configuration
                    </h3>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">PRX per USD</label>
                        <input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" defaultValue="100" type="number" />
                        <p className="text-xs text-muted-foreground mt-1.5">100 PRX = $1.00 USD</p>
                    </div>
                </div>
            </div>

            {/* Security Info */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="p-5 border-b">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Shield size={16} className="text-muted-foreground" />
                        Security
                    </h3>
                </div>
                <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Rate Limiting</p>
                            <p className="text-xs text-muted-foreground">Login: 10/min, Purchase: 10/min, Top-up: 5/min</p>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Webhook Signature</p>
                            <p className="text-xs text-muted-foreground">HMAC-SHA512 (base64)</p>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">CSP Headers</p>
                            <p className="text-xs text-muted-foreground">Content-Security-Policy enabled</p>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Active</span>
                    </div>
                </div>
            </div>

            {/* Webhook Info */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="p-5 border-b">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Key size={16} className="text-muted-foreground" />
                        Webhook
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Set this URL in MoneyMotion dashboard. API keys are configured via environment variables.
                    </p>
                </div>
                <div className="p-5">
                    <label className="text-sm font-medium mb-1.5 block">Webhook URL</label>
                    <div className="border-input flex h-9 w-full rounded-md border bg-muted/30 px-3 py-1 text-sm items-center">
                        <code className="text-xs text-muted-foreground">https://shop.parallax.cards/api/webhook</code>
                    </div>
                </div>
            </div>
        </div>
    );
}
