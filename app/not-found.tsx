"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ShoppingBag, ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8 min-h-[calc(100vh-68px)]">
            <div className="max-w-lg w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                >
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-muted/30 border flex items-center justify-center mb-6">
                        <Ghost size={40} className="text-muted-foreground/40" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-7xl font-bold font-mono bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent mb-3">
                            404
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            The page you&apos;re looking for doesn&apos;t exist or has been moved.
                            Check the URL or navigate back.
                        </p>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-5 transition-all cursor-pointer"
                    >
                        <Home size={16} />
                        Go Home
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-10 px-5 transition-all cursor-pointer"
                    >
                        <ShoppingBag size={16} />
                        Browse Shop
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8"
                >
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={12} />
                        Go back to previous page
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-[10px] text-muted-foreground/40"
                >
                    Parallax &copy; {new Date().getFullYear()}
                </motion.div>
            </div>
        </div>
    );
}
