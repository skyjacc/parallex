"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowUpRight,
    ChevronRight,
    Crosshair,
    Swords,
    Shield,
    Eye,
    Gamepad2,
    Box,
    Zap,
    Target,
    Skull,
    Flame,
    TrendingUp,
    CreditCard,
    Lock,
    Clock,
    HeadphonesIcon,
    RefreshCw,
    Sparkles,
    ArrowRight,
    ShoppingBag,
    BarChart3,
} from "lucide-react";

/* ── Marquee Row 1: Software Types ────────────────────────── */
const row1 = [
    { label: "Aimbot", icon: Crosshair },
    { label: "ESP / Wallhack", icon: Eye },
    { label: "Triggerbot", icon: Target },
    { label: "HWID Spoofer", icon: Box },
    { label: "Rage Hack", icon: Flame },
    { label: "Legit Cheat", icon: Shield },
    { label: "Anti-Cheat Bypass", icon: Shield },
    { label: "Skin Changer", icon: Sparkles },
    { label: "Radar Hack", icon: Eye },
    { label: "No Recoil", icon: Zap },
];

/* ── Marquee Row 2: Games ─────────────────────────────────── */
const row2 = [
    { label: "Valorant", icon: Target },
    { label: "CS2", icon: Crosshair },
    { label: "Rust", icon: Skull },
    { label: "Fortnite", icon: Gamepad2 },
    { label: "Apex Legends", icon: Flame },
    { label: "PUBG", icon: Swords },
    { label: "EFT / Tarkov", icon: Shield },
    { label: "Overwatch 2", icon: Zap },
    { label: "R6 Siege", icon: Target },
    { label: "DayZ", icon: Eye },
];

/* ── Product type ──────────────────────────────────────────── */
interface ProductData {
    id: string;
    name: string;
    description: string;
    pricePrx: number;
    available: number;
    totalSold: number;
}

/* ── Why Choose Us ────────────────────────────────────────── */
const whyUs = [
    { icon: Zap, title: "Instant Access", desc: "Get your key delivered instantly after purchase. No waiting, no delays." },
    { icon: RefreshCw, title: "Fast Updates", desc: "All cheats updated after each game patch. Downtime is always compensated." },
    { icon: Lock, title: "Undetected", desc: "Tested against BattlEye, EAC, Vanguard, and Ricochet before every release." },
    { icon: HeadphonesIcon, title: "24/7 Support", desc: "Real-time support from actual people. Most issues resolved in under 30 minutes." },
    { icon: Shield, title: "Security First", desc: "Encrypted injection, HWID spoofing, session-based loaders. No footprints left." },
    { icon: Clock, title: "Compensation", desc: "If a cheat goes down for any reason, the time will always be compensated." },
];

/* ── Marquee Component ────────────────────────────────────── */
function MarqueeRow({ items, reverse = false }: { items: typeof row1; reverse?: boolean }) {
    const style = reverse ? { animationDirection: "reverse" as const } : {};
    return (
        <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
            {[0, 1, 2, 3].map((copy) => (
                <div
                    key={copy}
                    className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]"
                    style={style}
                >
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <figure
                                key={`${copy}-${item.label}`}
                                className="relative h-full cursor-pointer overflow-hidden rounded-full p-1 pl-3 pr-3 flex items-center gap-2 border bg-sidebar hover:bg-muted/20 transition-colors"
                            >
                                <Icon className="w-4 h-4 opacity-70" />
                                <blockquote className="text-sm whitespace-nowrap">{item.label}</blockquote>
                            </figure>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default function Home() {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch("/api/products")
            .then((r) => r.json())
            .then((data) => { if (data.ok) setProducts(data.products); })
            .finally(() => setLoaded(true));
    }, []);

    const featured = products.slice(0, 4);
    const heroProducts = products.slice(0, 3);
    const productCount = products.length;

    return (
        <div className="flex justify-center w-full flex-col items-center px-4">
            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-x-0 md:top-[52px] top-[51px] h-1/6 bg-gradient-to-b from-background z-10" />

            {/* ── Hero ─────────────────────────────── */}
            <div className="mt-8 md:mt-[152px]">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                >
                    <span className="inline-flex items-center justify-center border text-xs w-fit whitespace-nowrap shrink-0 group max-w-full gap-2 rounded-full bg-background px-3 py-0.5 font-medium shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <span className="shrink-0 truncate rounded-full bg-primary/20 px-2.5 py-1 text-xs -ml-2.5">
                            New
                        </span>
                        <span className="flex items-center gap-1 py-1">
                            <span className="text-muted-foreground">Catalog updated weekly</span>
                            <Link href="/shop" className="text-muted-foreground hover:text-foreground flex items-center">
                                Browse
                            </Link>
                            <ArrowUpRight size={14} className="shrink-0 text-muted-foreground" />
                        </span>
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="pt-8 font-semibold md:text-5xl text-4xl pb-10 text-center pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-white to-muted bg-clip-text text-transparent leading-none"
                >
                    Unlock Your Advantage
                </motion.h1>
            </div>

            {/* ── Hero Card (Store-focused, no AI) ─── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 120, damping: 22 }}
                className="max-w-3xl w-full bg-border rounded-lg overflow-hidden"
            >
                {/* Top bar */}
                <div className="bg-border w-full rounded-t-xl border px-4 py-1 flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                        <Link href="/auth/signin" className="text-primary/50 hover:text-primary hover:underline">
                            SignIn
                        </Link>
                        {" "}to get free PRX
                    </span>
                    <Link href="/topup" className="text-primary/50 hover:text-primary text-sm">
                        Buy PRX
                    </Link>
                </div>

                {/* Status Preview */}
                <div className="border-[2px] rounded-lg overflow-hidden shadow-lg bg-sidebar">
                    {/* Status header */}
                    <div className="px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-muted-foreground"><path fillRule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793z"/></svg>
                            <span className="text-sm font-medium text-muted-foreground">Product Status</span>
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                            Online
                        </span>
                    </div>

                    {/* Popular products status */}
                    <div className="px-4 pb-3 flex flex-col gap-1">
                        {heroProducts.map((item) => (
                            <Link key={item.id} href={`/shop/${item.id}`} className="flex items-center justify-between py-1.5 px-2.5 rounded-md hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-muted-foreground/50"><path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793z"/></svg>
                                    <span className="text-sm text-foreground/80">{item.name}</span>
                                    <span className="text-[10px] text-muted-foreground/60 border border-border/50 rounded px-1 py-0.5">{item.pricePrx} PRX</span>
                                </div>
                                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${item.available > 0 ? "text-foreground/70 bg-muted/40" : "text-red-400 bg-red-500/10"}`}>
                                    {item.available > 0 ? "available" : "sold out"}
                                </span>
                            </Link>
                        ))}
                        {heroProducts.length === 0 && loaded && (
                            <p className="text-xs text-muted-foreground text-center py-2">No products yet</p>
                        )}
                    </div>

                    {/* Bottom bar */}
                    <div className="p-2 flex items-center justify-between border-t border-border/50">
                        <div className="flex gap-2 flex-row items-center p-1">
                            <Link
                                href="/shop"
                                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-md px-3 text-sm font-medium transition-all cursor-pointer"
                            >
                                <ShoppingBag size={14} />
                                Shop Now
                            </Link>
                            <Link
                                href="/status"
                                className="inline-flex items-center justify-center gap-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-sm font-medium transition-all cursor-pointer"
                            >
                                <BarChart3 size={14} />
                                All Status
                            </Link>
                        </div>

                        <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground p-1">
                            <Zap size={12} className="text-primary" />
                            {productCount}+ products
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* ── Marquee ─────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-3xl w-full pt-20"
            >
                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                    <MarqueeRow items={row1} />
                    <MarqueeRow items={row2} reverse />
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
                </div>
            </motion.div>

            {/* ── Featured Products ────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-6xl w-full pt-20"
            >
                <div className="flex flex-row justify-between items-center">
                    <h1 className="text-base font-semibold">Featured Products</h1>
                    <Link href="/shop">
                        <div className="flex text-xs text-muted-foreground items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
                            Browse All <ChevronRight size={12} />
                        </div>
                    </Link>
                </div>
                <p className="text-sm text-muted-foreground pb-3">
                    Instant key delivery. Pay with PRX tokens. Undetected & updated daily.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {featured.map((product, i) => (
                        <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.05 }}>
                            <Link
                                href={`/shop/${product.id}`}
                                data-slot="card"
                                className="bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border py-6 shadow-sm group hover:shadow-lg transition-all duration-200 overflow-hidden pt-0 cursor-pointer"
                            >
                                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/5 to-card">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Gamepad2 size={40} className="text-muted-foreground/20 group-hover:scale-110 transition-transform duration-200" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    <div className="absolute bottom-2 right-2 bg-muted text-sm px-2 py-1 rounded flex items-center gap-1.5">
                                        <Zap size={13} className="text-primary" />
                                        <span className="font-bold text-xs">{product.pricePrx} PRX</span>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <span className={`text-[10px] border rounded px-1.5 py-0.5 font-medium ${product.available > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                            {product.available > 0 ? "in stock" : "sold out"}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <span className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 shadow-xs">
                                            <TrendingUp size={16} />
                                            View Details
                                        </span>
                                    </div>
                                </div>
                                <div className="grid auto-rows-min gap-1.5 px-6 pb-4">
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-xs text-muted-foreground">{product.totalSold} sold</span>
                                        <span className="text-xs text-muted-foreground">Instant delivery</span>
                                    </div>
                                    <div className="font-semibold text-md">{product.name}</div>
                                    <div className="text-muted-foreground text-xs line-clamp-2">{product.description}</div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── Why Parallax ────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="max-w-6xl w-full pt-24"
            >
                <h2 className="text-2xl font-semibold text-center mb-2">Why Parallax</h2>
                <p className="text-sm text-muted-foreground text-center mb-10 max-w-lg mx-auto">
                    Built for players who demand reliability, not risks. No unstable scripts. No outdated exploits.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {whyUs.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                                className="flex gap-4 items-start"
                            >
                                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Icon size={20} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Payment Methods ──────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="max-w-3xl w-full pt-24 pb-20"
            >
                <div className="rounded-2xl border bg-card p-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <CreditCard size={20} className="text-primary" />
                        <h2 className="text-lg font-semibold">Payment Methods</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                        Top up your PRX balance using any of these methods. All payments are encrypted and secure.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {[
                            { name: "Visa", svg: <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#1A1F71"/><path d="M19.5 21H17L18.75 11H21.25L19.5 21Z" fill="white"/><path d="M28.5 11.25C28 11.05 27.2 10.8 26.2 10.8C23.7 10.8 22 12.1 22 13.85C22 15.15 23.2 15.85 24.1 16.3C25 16.75 25.35 17.05 25.35 17.45C25.35 18.05 24.6 18.3 23.9 18.3C22.9 18.3 22.35 18.15 21.5 17.8L21.15 17.65L20.8 19.85C21.45 20.15 22.65 20.4 23.9 20.4C26.55 20.4 28.2 19.15 28.2 17.25C28.2 16.2 27.55 15.4 26.15 14.75C25.35 14.35 24.85 14.05 24.85 13.6C24.85 13.2 25.3 12.8 26.3 12.8C27.1 12.8 27.7 12.95 28.15 13.15L28.4 13.25L28.5 11.25Z" fill="white"/><path d="M32.5 11H30.5C29.9 11 29.4 11.2 29.15 11.8L25.5 21H28.15L28.7 19.4H31.9L32.2 21H34.5L32.5 11ZM29.4 17.5L30.7 13.8L31.4 17.5H29.4Z" fill="white"/><path d="M16.5 11L14 17.8L13.7 16.3C13.2 14.7 11.7 13 10 12.15L12.25 21H14.95L19.2 11H16.5Z" fill="white"/><path d="M12.5 11H8.5L8.45 11.2C11.65 12 13.75 14 14.5 16.3L13.7 11.85C13.55 11.2 13.05 11.02 12.5 11Z" fill="#F9A533"/></svg> },
                            { name: "Mastercard", svg: <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#252525"/><circle cx="19" cy="16" r="8" fill="#EB001B"/><circle cx="29" cy="16" r="8" fill="#F79E1B"/><path d="M24 10.3C25.8 11.7 27 13.7 27 16C27 18.3 25.8 20.3 24 21.7C22.2 20.3 21 18.3 21 16C21 13.7 22.2 11.7 24 10.3Z" fill="#FF5F00"/></svg> },
                            { name: "PayPal", svg: <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#003087"/><path d="M20.5 8H26C28.5 8 30 9.5 29.7 12C29.3 15 27 16.5 24.5 16.5H23L22 22H19L20.5 8Z" fill="#009CDE"/><path d="M18.5 10H24C26.5 10 28 11.5 27.7 14C27.3 17 25 18.5 22.5 18.5H21L20 24H17L18.5 10Z" fill="white"/></svg> },
                            { name: "Bitcoin", svg: <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#F7931A"/><path d="M30 14.5C30.3 12.5 28.8 11.4 26.7 10.7L27.3 8.3L25.8 7.9L25.2 10.2C24.8 10.1 24.4 10 24 9.9L24.6 7.6L23.1 7.2L22.5 9.6C22.2 9.5 21.8 9.4 21.5 9.3L19.5 8.8L19.1 10.4C19.1 10.4 20.2 10.7 20.2 10.7C20.8 10.8 20.9 11.2 20.9 11.5L20.2 14.3C20.2 14.3 20.3 14.3 20.4 14.4L20.2 14.3L19.2 18.1C19.2 18.3 19 18.6 18.5 18.4L17.4 18.1L16.7 19.9L18.6 20.4L19.3 20.6L18.7 23L20.2 23.4L20.8 21C21.2 21.1 21.6 21.2 22 21.3L21.4 23.7L22.9 24.1L23.5 21.7C26 22.2 27.9 22 28.7 19.8C29.4 18 28.7 16.9 27.4 16.2C28.3 16 29 15.4 30 14.5Z" fill="white"/></svg> },
                            { name: "Ethereum", svg: <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#627EEA"/><path d="M24 5L18 16.5L24 20L30 16.5L24 5Z" fill="white" fillOpacity="0.6"/><path d="M24 5L18 16.5L24 13.5V5Z" fill="white"/><path d="M24 21.5L18 17.5L24 27L30 17.5L24 21.5Z" fill="white" fillOpacity="0.6"/><path d="M24 27L18 17.5L24 21.5V27Z" fill="white"/></svg> },
                        ].map((method) => (
                            <div
                                key={method.name}
                                className="inline-flex items-center gap-2.5 rounded-lg border bg-sidebar px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all cursor-default"
                            >
                                {method.svg}
                                {method.name}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Lock size={12} /> Encrypted</span>
                        <span className="flex items-center gap-1.5"><Zap size={12} /> Instant</span>
                        <span className="flex items-center gap-1.5"><Shield size={12} /> No data stored</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                    {[
                        { label: "Orders", value: "10,000+" },
                        { label: "Customers", value: "5,000+" },
                        { label: "Reviews", value: "2,500+" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center py-4 rounded-xl border bg-card">
                            <div className="text-lg font-bold">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
