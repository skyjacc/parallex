"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Package,
    ShoppingBag,
    Users,
    Settings,
    Zap,
} from "lucide-react";

const adminTabs = [
    { href: "/admin", icon: BarChart3, label: "Overview", exact: true },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isTabActive = (tab: (typeof adminTabs)[0]) =>
        tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

    return (
        <div className="flex justify-center w-full flex-col items-center">
            <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 py-6">
                {/* Breadcrumb */}
                <nav className="text-muted-foreground flex items-center gap-1 text-xs mb-4">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5">
                            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Admin</span>
                </nav>

                {/* Page header */}
                <div className="flex flex-col lg:flex-row justify-between gap-4 lg:items-end mb-8">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-semibold">
                            {adminTabs.find((t) => isTabActive(t))?.label || "Admin"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your store, products, and customers.
                        </p>
                    </div>
                </div>

                {/* Tab navigation */}
                <div className="flex items-center gap-1 border-b mb-8 overflow-x-auto">
                    {adminTabs.map((tab) => {
                        const active = isTabActive(tab);
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                                    active
                                        ? "border-primary text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Tab content */}
                {children}
            </div>
        </div>
    );
}
