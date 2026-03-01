"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Gamepad2, Zap, Search, Filter, TrendingUp, Loader2 } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    pricePrx: number;
    available: number;
    totalSold: number;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/products")
            .then((r) => r.json())
            .then((data) => {
                if (data.ok) setProducts(data.products);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-6xl w-full">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold mb-2">Shop</h1>
                    <p className="text-sm text-muted-foreground">
                        Browse all available products. Pay with PRX tokens for instant key delivery.
                    </p>
                </div>

                <div className="flex gap-3 mb-6">
                    <div className="flex-1 flex items-center gap-2 border rounded-lg bg-card px-3 py-2">
                        <Search size={16} className="text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Gamepad2 size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((product) => (
                            <Link
                                key={product.id}
                                href={`/shop/${product.id}`}
                                data-slot="card"
                                className="bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border py-6 shadow-sm group hover:shadow-lg transition-all duration-200 overflow-hidden pt-0 cursor-pointer"
                            >
                                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/5 to-card">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Gamepad2 size={36} className="text-muted-foreground/20 group-hover:scale-110 transition-transform duration-200" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    <div className="absolute bottom-2 right-2 bg-muted text-sm px-2 py-1 rounded flex items-center gap-1.5">
                                        <Zap size={12} className="text-primary" />
                                        <span className="font-bold text-xs">{product.pricePrx} PRX</span>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <span className={`text-[10px] border rounded px-1.5 py-0.5 font-medium ${product.available > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                            {product.available > 0 ? `${product.available} in stock` : "Out of stock"}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <span className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 shadow-xs">
                                            <TrendingUp size={14} />
                                            View Details
                                        </span>
                                    </div>
                                </div>
                                <div className="grid auto-rows-min gap-1.5 px-4 pb-3">
                                    <div className="flex items-center justify-between w-full">
                                        <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium text-xs ${product.available > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                            {product.available > 0 ? "available" : "sold out"}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">{product.totalSold} sold</span>
                                    </div>
                                    <div className="font-semibold text-sm">{product.name}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-2">{product.description}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
