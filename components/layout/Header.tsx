"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, Zap, LogOut } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useSession, signOut } from "next-auth/react";

const pageTitles: Record<string, string> = {
    "/": "Welcome",
    "/shop": "Catalog",
    "/status": "Product Status",
    "/dashboard": "My Orders",
    "/topup": "Top Up PRX",
    "/account": "Account",
    "/admin": "Admin Panel",
};

export function Header() {
    const pathname = usePathname();
    const { toggle } = useSidebar();
    const { data: session } = useSession();

    const title =
        Object.entries(pageTitles).find(([path]) =>
            path === "/" ? pathname === "/" : pathname.startsWith(path)
        )?.[1] || "Parallax";

    return (
        <header className="flex h-[calc(0.25rem*13)] shrink-0 items-center gap-2 border-b">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                {/* Sidebar trigger */}
                <button onClick={toggle} className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground size-7 -ml-2 transition-all">
                    <PanelLeft size={16} />
                    <span className="sr-only">Toggle Sidebar</span>
                </button>

                {/* Separator */}
                <div className="bg-border shrink-0 w-px mx-2 h-4" />

                {/* Title */}
                <h1 className="text-base font-medium truncate" title={title}>
                    {session?.user?.name ? `Hi ${session.user.name}` : title}
                </h1>

                {/* Right side */}
                <div className="ml-auto flex items-center gap-2">
                    {session?.user ? (
                        <>
                            {/* PRX Balance */}
                            <div className="inline-flex items-center gap-1.5 border bg-background shadow-xs h-8 rounded-md px-3 text-sm">
                                <Zap size={14} className="text-primary" />
                                <span className="font-semibold">{(session.user as any).prxBalance?.toFixed(0) || "0"}</span>
                                <span className="text-muted-foreground text-xs">PRX</span>
                            </div>

                            {/* Sign Out */}
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3 transition-all cursor-pointer"
                            >
                                <LogOut size={14} />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3 transition-all">
                                <Link href="/auth/signin">Sign In</Link>
                            </button>
                            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-8 rounded-md gap-1.5 px-3 transition-all">
                                <Link href="/auth/signup">Sign Up</Link>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
