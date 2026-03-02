import { DollarSign, Zap, CreditCard, Bot, BarChart3, Bell, Target, Tag } from "lucide-react";
import Link from "next/link";

const benefits = [
    { icon: DollarSign, title: "50% Starting Discount", desc: "Start with 50% off on all products, with possibilities to unlock even higher discounts" },
    { icon: Zap, title: "Instant Key Delivery", desc: "Automated instant delivery system for all orders" },
    { icon: CreditCard, title: "Multiple Payment Methods", desc: "Crypto, credit/debit cards, and bank transfers available" },
    { icon: Bot, title: "Full API Automation", desc: "Seller API for automated sales, stock management, and delivery" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Track your store traffic, sales stats, and performance metrics" },
    { icon: Bell, title: "Discord Webhooks", desc: "Get automatic product updates directly in your Discord server" },
    { icon: Target, title: "Reseller Panel", desc: "Manage orders, view stock, and reset HWIDs from one dashboard" },
    { icon: Tag, title: "White-Label Options", desc: "Sell products under your own brand name" },
];

export default function ResellerPage() {
    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-3">Parallax Reselling Program</h1>
                    <p className="text-lg text-muted-foreground mb-2">Start Your Reselling Business Today</p>
                    <p className="text-sm text-muted-foreground">One platform. 100+ products. Unlimited earnings potential.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                    <div className="rounded-xl border bg-card p-5 text-center"><p className="text-2xl font-bold">100+</p><p className="text-xs text-muted-foreground">Products</p></div>
                    <div className="rounded-xl border bg-card p-5 text-center"><p className="text-2xl font-bold">50%</p><p className="text-xs text-muted-foreground">Starting Discount</p></div>
                    <div className="rounded-xl border bg-card p-5 text-center"><p className="text-2xl font-bold">$300</p><p className="text-xs text-muted-foreground">Initial Deposit</p></div>
                    <div className="rounded-xl border bg-card p-5 text-center"><p className="text-2xl font-bold">24/7</p><p className="text-xs text-muted-foreground">Support</p></div>
                </div>

                <h2 className="text-xl font-semibold mb-6 text-center">Benefits</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    {benefits.map((b) => { const I = b.icon; return (
                        <div key={b.title} className="rounded-xl border bg-card p-5 flex gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><I size={20} className="text-primary" /></div>
                            <div><h3 className="text-sm font-semibold mb-1">{b.title}</h3><p className="text-xs text-muted-foreground">{b.desc}</p></div>
                        </div>
                    ); })}
                </div>

                <div className="rounded-xl border bg-card p-8 text-center mb-8">
                    <h2 className="text-xl font-semibold mb-3">Ready to Start?</h2>
                    <p className="text-sm text-muted-foreground mb-6">Join Parallax Reselling with 50% off and a $300 deposit. Contact us to apply.</p>
                    <Link href="/support" className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-6 cursor-pointer gap-2">
                        Apply Now via Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
