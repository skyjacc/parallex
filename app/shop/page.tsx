"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Gamepad2, Zap, Search, TrendingUp, Loader2, Shield, AlertTriangle, RefreshCw, Star, Filter } from "lucide-react";

interface Product {
    id: string; name: string; description: string; pricePrx: number;
    available: number; totalSold: number; reviewCount: number; avgRating: number | null;
    category: string | null; categorySlug: string | null;
    cheatType: string | null; detectionStatus: string; featured: boolean;
}

interface Category { id: string; name: string; slug: string; productCount: number }

const statusColors: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    UNDETECTED: { label: "Undetected", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Shield },
    TESTING: { label: "Testing", color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertTriangle },
    UPDATING: { label: "Updating", color: "text-blue-400", bg: "bg-blue-500/10", icon: RefreshCw },
};

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const params = activeCategory ? `?category=${activeCategory}` : "";
        fetch(`/api/products${params}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.ok) {
                    setProducts(data.products);
                    if (data.categories) setCategories(data.categories);
                }
            })
            .finally(() => setLoading(false));
    }, [activeCategory]);

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-6xl w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold mb-2">Shop</h1>
                    <p className="text-sm text-muted-foreground">
                        {products.length} products across {categories.length} categories. Pay with PRX for instant delivery.
                    </p>
                </div>

                <div className="flex gap-4 mb-6">
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

                {/* Category pills */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${!activeCategory ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}
                    >
                        All ({categories.reduce((s, c) => s + c.productCount, 0)})
                    </button>
                    {categories.filter((c) => c.productCount > 0).map((c) => (
                        <button
                            key={c.slug}
                            onClick={() => setActiveCategory(c.slug === activeCategory ? null : c.slug)}
                            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeCategory === c.slug ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}
                        >
                            {c.name} ({c.productCount})
                        </button>
                    ))}
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((product) => {
                            const st = statusColors[product.detectionStatus] || statusColors.UNDETECTED;
                            const StIcon = st.icon;
                            return (
                                <Link
                                    key={product.id}
                                    href={`/shop/${product.id}`}
                                    className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm group hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                                >
                                    <div className="p-4 flex flex-col gap-3 flex-1">
                                        {/* Top row: badges */}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${st.bg} ${st.color}`}>
                                                <StIcon size={10} />{st.label}
                                            </span>
                                            {product.cheatType && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                    {product.cheatType}
                                                </span>
                                            )}
                                            {product.featured && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                    Featured
                                                </span>
                                            )}
                                        </div>

                                        {/* Name */}
                                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{product.name}</h3>

                                        {/* Description */}
                                        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{product.description}</p>

                                        {/* Category */}
                                        {product.category && (
                                            <span className="text-[10px] text-muted-foreground/60">{product.category}</span>
                                        )}

                                        {/* Bottom row */}
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <div className="flex items-center gap-1">
                                                <Zap size={12} className="text-primary" />
                                                <span className="text-sm font-bold font-mono">{product.pricePrx} PRX</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {product.avgRating && (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                                        <Star size={10} className="text-amber-400 fill-amber-400" />
                                                        {product.avgRating}
                                                    </span>
                                                )}
                                                <span className={`text-[10px] font-medium ${product.available > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                    {product.available > 0 ? `${product.available} in stock` : "Sold out"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
