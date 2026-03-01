"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ShoppingBag, LayoutDashboard, Wallet, Package, X, Crosshair, Shield, Gamepad2, HeadphonesIcon } from "lucide-react";

const suggestions = [
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/topup", label: "Top Up PRX", icon: Wallet },
];

const games = [
    { href: "/shop", label: "Valorant", icon: Crosshair },
    { href: "/shop", label: "Rust", icon: Shield },
    { href: "/shop", label: "CS2", icon: Gamepad2 },
    { href: "/shop", label: "Fortnite", icon: Gamepad2 },
];

const help = [
    { href: "/status", label: "Status", icon: Shield },
    { href: "/auth/signin", label: "Sign In", icon: Package },
    { href: "/auth/signup", label: "Sign Up", icon: Package },
];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Cmd+K to open
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                if (open) onClose();
                else {
                    // Need to call from parent — this just closes
                }
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Dialog */}
            <div
                className="relative z-10 w-full max-w-lg rounded-lg border bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search input */}
                <div className="flex h-12 items-center gap-2 border-b px-3">
                    <Search size={16} className="shrink-0 opacity-50" />
                    <input
                        ref={inputRef}
                        className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Type a command or search..."
                        type="text"
                    />
                </div>

                {/* Results */}
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {/* Suggestions */}
                    <div className="p-1">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Navigation</div>
                        {suggestions.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.href + item.label} href={item.href} onClick={onClose}>
                                    <div className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                        <Icon size={16} className="text-muted-foreground" />
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Games */}
                    <div className="p-1">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Games</div>
                        {games.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.label} href={item.href} onClick={onClose}>
                                    <div className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                        <Icon size={16} className="text-muted-foreground" />
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Help */}
                    <div className="p-1">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Help</div>
                        {help.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.href + item.label} href={item.href} onClick={onClose}>
                                    <div className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                        <Icon size={16} className="text-muted-foreground" />
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-center text-sm text-muted-foreground pb-2 pt-1">
                        2026 @ Parallax
                    </div>
                </div>

                {/* Close */}
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
