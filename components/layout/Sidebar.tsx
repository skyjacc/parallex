"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Search,
    ShoppingBag,
    LayoutDashboard,
    Wallet,
    Package,
    History,
    EllipsisVertical,
    Activity,
    LogOut,
    CircleUser,
    Zap,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useState, useRef, useEffect } from "react";
import { SearchDialog } from "./SearchDialog";
import { useSession, signOut } from "next-auth/react";

// Public — visible to everyone
const publicNav = [
    { href: "/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/status", icon: Activity, label: "Status" },
    { href: "/topup", icon: Wallet, label: "Top Up" },
];

// Auth-only — visible when logged in
const authNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "My Orders" },
];

// Admin-only — visible when role === ADMIN
const adminNav = [
    { href: "/admin", icon: Package, label: "Admin" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { collapsed } = useSidebar();
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    // Widths: collapsed = icon-only (3rem+1rem+2px), expanded = full (16rem)
    const spacerW = collapsed ? "w-[calc(3rem+1rem)]" : "w-64";
    const containerW = collapsed ? "w-[calc(3rem+1rem+2px)]" : "w-[calc(16rem+2px)]";

    return (
        <div
            className="group peer text-sidebar-foreground hidden md:block"
            data-state={collapsed ? "collapsed" : "expanded"}
            data-collapsible={collapsed ? "icon" : ""}
            data-variant="inset"
        >
            {/* Spacer */}
            <div className={`relative bg-transparent transition-[width] duration-200 ease-linear ${spacerW}`} />

            {/* Fixed sidebar container */}
            <div className={`fixed inset-y-0 z-10 hidden h-svh md:flex left-0 p-2 transition-[width] duration-200 ease-linear ${containerW}`}>
                <div className="bg-sidebar flex h-full w-full flex-col overflow-hidden">
                    {/* ── Header / Logo ── */}
                    <div className="flex flex-col gap-2 p-2">
                        <Link href="/" className="select-none hover:bg-transparent -mt-1">
                            {!collapsed ? (
                                <span className="flex gap-2 items-center text-foreground font-bold text-lg px-1 py-2">
                                    <span className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center shrink-0">
                                        <span className="text-background font-black text-xs">P</span>
                                    </span>
                                    <span className="truncate">Parallax</span>
                                </span>
                            ) : (
                                <div className="h-8 w-8 bg-foreground rounded-md flex items-center justify-center mt-1">
                                    <span className="text-background font-black text-sm leading-none">P</span>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* ── Content ── */}
                    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
                        {/* Primary nav group */}
                        <div className="relative flex w-full min-w-0 flex-col p-2">
                            <div className="w-full text-sm flex flex-col gap-2">
                                {/* Home primary button */}
                                <div className="flex flex-col gap-1">
                                    <Link
                                        href="/"
                                        title="Main"
                                        className={`flex items-center gap-2 rounded-md p-2 h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer overflow-hidden min-w-8 ${collapsed ? "w-8 justify-center" : "w-full"}`}
                                    >
                                        <Home size={16} className="shrink-0" />
                                        {!collapsed && <span className="truncate">Main</span>}
                                    </Link>
                                </div>

                                {/* Search + nav items */}
                                <div className="flex flex-col gap-1">
                                    {/* Search */}
                                    <button
                                        onClick={() => setSearchOpen(true)}
                                        title="Search"
                                        className={`flex items-center gap-2 rounded-md p-2 h-8 text-sm transition-all duration-200 cursor-pointer overflow-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${collapsed ? "w-8 justify-center" : "w-full justify-between"}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Search size={16} className="shrink-0" />
                                            {!collapsed && <span>Search</span>}
                                        </div>
                                        {!collapsed && (
                                            <kbd className="bg-muted text-muted-foreground pointer-events-none flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] select-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>
                                                <span className="text-[12px] mt-[1px]">K</span>
                                            </kbd>
                                        )}
                                    </button>

                                    {/* Public nav — always visible */}
                                    {publicNav.map((item) => {
                                        const active = isActive(item.href);
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                title={item.label}
                                                className={`flex items-center gap-2 rounded-md p-2 h-8 text-sm transition-all duration-200 cursor-pointer overflow-hidden
                                                    ${collapsed ? "w-8 justify-center" : "w-full"}
                                                    ${active
                                                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                    }`}
                                            >
                                                <Icon size={16} className="shrink-0" />
                                                {!collapsed && <span className="truncate">{item.label}</span>}
                                            </Link>
                                        );
                                    })}

                                    {/* Auth-only nav — only when logged in */}
                                    {session?.user && authNav.map((item) => {
                                        const active = isActive(item.href);
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                title={item.label}
                                                className={`flex items-center gap-2 rounded-md p-2 h-8 text-sm transition-all duration-200 cursor-pointer overflow-hidden
                                                    ${collapsed ? "w-8 justify-center" : "w-full"}
                                                    ${active
                                                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                    }`}
                                            >
                                                <Icon size={16} className="shrink-0" />
                                                {!collapsed && <span className="truncate">{item.label}</span>}
                                            </Link>
                                        );
                                    })}

                                    {/* Admin-only nav — only when ADMIN */}
                                    {(session?.user as any)?.role === "ADMIN" && adminNav.map((item) => {
                                        const active = isActive(item.href);
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                title={item.label}
                                                className={`flex items-center gap-2 rounded-md p-2 h-8 text-sm transition-all duration-200 cursor-pointer overflow-hidden
                                                    ${collapsed ? "w-8 justify-center" : "w-full"}
                                                    ${active
                                                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                    }`}
                                            >
                                                <Icon size={16} className="shrink-0" />
                                                {!collapsed && <span className="truncate">{item.label}</span>}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ── Recent Orders section (expanded + logged in only) ── */}
                        {!collapsed && session?.user && (
                            <div className="relative flex w-full min-w-0 flex-col p-2">
                                <div className="text-sidebar-foreground/70 h-8 shrink-0 rounded-md px-2 text-xs font-medium flex items-center gap-2">
                                    <History size={16} />
                                    <span>Recent Orders</span>
                                </div>
                                <div className="px-3 py-4 text-center">
                                    <p className="text-xs text-muted-foreground">No orders yet</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer / User Profile ── */}
                    <div className="flex flex-col gap-2 p-2 relative" ref={profileRef}>
                        {/* Dropdown menu */}
                        {profileOpen && session?.user && !collapsed && (
                            <div className="absolute bottom-16 left-2 right-2 z-50 bg-popover text-popover-foreground border rounded-lg shadow-md p-1 animate-in fade-in-0 zoom-in-95">
                                {/* User info */}
                                <div className="px-2 py-1.5 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex size-8 shrink-0 overflow-hidden h-8 w-8 rounded-md border bg-muted items-center justify-center">
                                            {session.user.image ? (
                                                <img src={session.user.image} alt="" className="aspect-square size-full" />
                                            ) : (
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {session.user.name?.[0]?.toUpperCase()}
                                                </span>
                                            )}
                                        </span>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">{session.user.name}</span>
                                            <span className="text-muted-foreground truncate text-xs">{session.user.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-border -mx-1 my-1 h-px" />

                                {/* PRX Balance */}
                                <div className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground">
                                    <Zap size={16} />
                                    <span>{(session.user as any).prxBalance?.toFixed(0) || "0"} PRX</span>
                                </div>

                                <div className="bg-border -mx-1 my-1 h-px" />

                                {/* Account */}
                                <Link
                                    href="/account"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                                >
                                    <CircleUser size={16} className="text-muted-foreground" />
                                    Account
                                </Link>

                                <div className="bg-border -mx-1 my-1 h-px" />

                                {/* Log out */}
                                <button
                                    onClick={() => { setProfileOpen(false); signOut({ callbackUrl: "/" }); }}
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                                >
                                    <LogOut size={16} className="text-muted-foreground" />
                                    Log out
                                </button>
                            </div>
                        )}

                        {/* Profile button */}
                        <button
                            onClick={() => {
                                if (!session?.user) {
                                    window.location.href = "/auth/signin";
                                    return;
                                }
                                setProfileOpen((prev) => !prev);
                            }}
                            className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer ${collapsed ? "justify-center h-8 w-8" : "h-12"} ${profileOpen ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
                        >
                            <span className="relative flex size-8 shrink-0 overflow-hidden h-8 w-8 rounded-md border bg-muted items-center justify-center">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt={session.user.name || ""} className="aspect-square size-full" />
                                ) : (
                                    <span className="text-xs font-bold text-muted-foreground">
                                        {session?.user?.name?.[0]?.toUpperCase() || "G"}
                                    </span>
                                )}
                            </span>
                            {!collapsed && (
                                <>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">
                                            {session?.user?.name || "Guest"}
                                        </span>
                                        <span className="text-muted-foreground truncate text-xs">
                                            {session?.user?.email || "Not signed in"}
                                        </span>
                                    </div>
                                    <EllipsisVertical size={16} className="ml-auto shrink-0" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Dialog */}
            <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
