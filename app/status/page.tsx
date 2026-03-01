"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, CheckCircle, Loader2 } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    pricePrx: number;
    available: number;
    totalSold: number;
}

export default function StatusPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/products")
            .then((r) => r.json())
            .then((data) => { if (data.ok) setProducts(data.products); })
            .finally(() => setLoading(false));
    }, []);

    const availableCount = products.filter((p) => p.available > 0).length;
    const soldOutCount = products.filter((p) => p.available === 0).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={28} className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full px-4 py-8">
            <div className="max-w-4xl w-full">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield size={24} className="text-primary" />
                        <h1 className="text-2xl font-bold">Product Status</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Real-time stock status of all products. Click on any product to view details.
                    </p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-lg font-bold">{availableCount}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">In Stock</span>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-lg font-bold">{soldOutCount}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Sold Out</span>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-lg font-bold">{products.length}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                </div>

                {/* Overall status */}
                <div className="flex items-center gap-3 mb-6 rounded-lg border bg-card px-4 py-3">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-sm font-medium">All systems operational</span>
                    <span className="ml-auto text-xs text-muted-foreground">Last check: just now</span>
                </div>

                {/* Product list */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="hidden sm:grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
                        <span>Product</span>
                        <span>Status</span>
                        <span>Price</span>
                        <span>Sold</span>
                    </div>

                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.id}`}
                            className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_80px] gap-2 sm:gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-muted/20 transition-colors items-center"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{product.name}</span>
                                <span className="text-[11px] text-muted-foreground line-clamp-1">{product.description}</span>
                            </div>
                            <div>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md bg-muted/50 ${product.available > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    <CheckCircle size={12} />
                                    {product.available > 0 ? `${product.available} keys` : "Sold out"}
                                </span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">{product.pricePrx} PRX</span>
                            <span className="text-xs text-muted-foreground">{product.totalSold} sold</span>
                        </Link>
                    ))}
                </div>

                <div className="mt-6 text-center text-xs text-muted-foreground">
                    <p>Stock updates are real-time from our database.</p>
                    <p className="mt-1">© 2026 Parallax. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
