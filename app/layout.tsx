import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Parallax | #1 Source for Premium Game Cheats",
    description: "Unleash your gaming experience with Parallax: premium, undetected cheats and hacks. Pay with PRX tokens, get instant key delivery.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body
                className={`${inter.className} bg-sidebar flex min-h-svh w-full`}
                style={{
                    "--sidebar-width-icon": "3rem",
                    "--header-height": "calc(0.25rem * 13)",
                } as React.CSSProperties}
                suppressHydrationWarning
            >
                <SessionProvider>
                    <SidebarProvider>
                        <Sidebar />
                        <main className="bg-background relative flex w-full flex-1 flex-col md:m-2 md:ml-0 md:peer-data-[state=collapsed]:ml-0 md:rounded-xl md:shadow-sm transition-all duration-200">
                            <Header />
                            <div className="flex flex-col">
                                <div className="h-[calc(100vh-68px)] overflow-y-auto" id="main-scroll-container">
                                    {children}
                                </div>
                            </div>
                        </main>
                    </SidebarProvider>
                    <Toaster
                        theme="dark"
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: "oklch(21.34% 0 0)",
                                border: "1px solid oklch(23.51% 0.0115 91.7467)",
                                color: "oklch(94.91% 0 0)",
                            },
                        }}
                    />
                </SessionProvider>
            </body>
        </html>
    );
}
