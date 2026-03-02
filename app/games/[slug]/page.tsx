"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Gamepad2, Zap, Shield, AlertTriangle, RefreshCw, Loader2, Star, ArrowLeft } from "lucide-react";

interface Product {
    id: string; name: string; description: string; pricePrx: number;
    available: number; totalSold: number; avgRating: number | null;
    cheatType: string | null; detectionStatus: string;
}

const statusColors: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    UNDETECTED: { label: "Undetected", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Shield },
    TESTING: { label: "Testing", color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertTriangle },
    UPDATING: { label: "Updating", color: "text-blue-400", bg: "bg-blue-500/10", icon: RefreshCw },
};

export default function GamePage() {
    const { slug } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [catName, setCatName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/products?category=${slug}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.ok) {
                    setProducts(d.products);
                    const cat = d.categories?.find((c: any) => c.slug === slug);
                    if (cat) setCatName(cat.name);
                }
            })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>;

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-4xl w-full">
                <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                    <ArrowLeft size={14} /> Back to Store
                </Link>

                <h1 className="text-2xl font-bold mb-2">{catName || String(slug)} Cheats & Hacks</h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Browse all {catName} products. Undetected, instant delivery, 24/7 support.
                </p>

                {products.length === 0 ? (
                    <div className="text-center py-16"><Gamepad2 size={40} className="mx-auto text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">No products in this category yet</p></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {products.map((p) => {
                            const st = statusColors[p.detectionStatus] || statusColors.UNDETECTED;
                            const StIcon = st.icon;
                            return (
                                <Link key={p.id} href={`/shop/${p.id}`} className="bg-card border rounded-xl p-4 flex flex-col gap-3 hover:shadow-lg transition-all cursor-pointer group">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${st.bg} ${st.color}`}><StIcon size={10} />{st.label}</span>
                                        {p.cheatType && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p.cheatType}</span>}
                                    </div>
                                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{p.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{p.description}</p>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="flex items-center gap-1 text-sm font-bold font-mono"><Zap size={12} className="text-primary" />{p.pricePrx} PRX</span>
                                        <span className={`text-[10px] font-medium ${p.available > 0 ? "text-emerald-400" : "text-red-400"}`}>{p.available > 0 ? `${p.available} in stock` : "Sold out"}</span>
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
