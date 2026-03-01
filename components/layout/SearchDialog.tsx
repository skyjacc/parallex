"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search, ShoppingBag, LayoutDashboard, Wallet, X,
    Activity, Zap, Gamepad2, ArrowRight, Loader2,
} from "lucide-react";

interface Product {
    id: string;
    name: string;
    pricePrx: number;
    available: number;
}

const navItems = [
    { href: "/", label: "Home", icon: ArrowRight },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/topup", label: "Top Up PRX", icon: Wallet },
    { href: "/status", label: "Status", icon: Activity },
];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
            if (!loaded) {
                setLoading(true);
                fetch("/api/products")
                    .then((r) => r.json())
                    .then((d) => { if (d.ok) setProducts(d.products); })
                    .finally(() => { setLoading(false); setLoaded(true); });
            }
        } else {
            setQuery("");
        }
    }, [open, loaded]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (open) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    const q = query.toLowerCase().trim();

    const filteredNav = q
        ? navItems.filter((i) => i.label.toLowerCase().includes(q))
        : navItems;

    const filteredProducts = q
        ? products.filter((p) => p.name.toLowerCase().includes(q))
        : products.slice(0, 5);

    const handleSelect = useCallback((href: string) => {
        onClose();
        router.push(href);
    }, [onClose, router]);

    if (!open) return null;

    const hasResults = filteredNav.length > 0 || filteredProducts.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50" />

            <div
                className="relative z-10 w-full max-w-lg rounded-lg border bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex h-12 items-center gap-2 border-b px-3">
                    <Search size={16} className="shrink-0 opacity-50" />
                    <input
                        ref={inputRef}
                        className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Search products, pages..."
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && filteredProducts.length > 0) {
                                handleSelect(`/shop/${filteredProducts[0].id}`);
                            }
                        }}
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="shrink-0 opacity-50 hover:opacity-100 p-1">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="max-h-[350px] overflow-y-auto p-1">
                    {loading && (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 size={18} className="animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!loading && !hasResults && q && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No results for &ldquo;{query}&rdquo;
                        </div>
                    )}

                    {!loading && filteredProducts.length > 0 && (
                        <div className="p-1">
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                {q ? `Products (${filteredProducts.length})` : "Popular Products"}
                            </div>
                            {filteredProducts.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelect(`/shop/${p.id}`)}
                                    className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground w-full text-left transition-colors"
                                >
                                    <Gamepad2 size={16} className="text-muted-foreground shrink-0" />
                                    <span className="flex-1 truncate">{p.name}</span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                        <Zap size={10} className="text-primary" />
                                        {p.pricePrx}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.available > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                        {p.available > 0 ? `${p.available}` : "0"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading && filteredNav.length > 0 && (
                        <div className="p-1">
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Navigation</div>
                            {filteredNav.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => handleSelect(item.href)}
                                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground w-full text-left transition-colors"
                                    >
                                        <Icon size={16} className="text-muted-foreground" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 rounded-full opacity-70 hover:opacity-100 hover:bg-muted p-1 transition-opacity"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
