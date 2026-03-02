"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
    { q: "What payment methods do you accept?", a: "We accept credit/debit cards via MoneyMotion (Visa, Mastercard). Crypto and PayPal support coming soon. All payments are processed securely." },
    { q: "My payment failed, what do I do?", a: "If your payment failed, please try again with a different card. If the issue persists, create a support ticket and we will help resolve it." },
    { q: "My product isn't working, what do I do?", a: "First, make sure you followed the setup guide. If the issue persists, create a support ticket with your order ID and we'll assist you." },
    { q: "Can I get a refund?", a: "All sales are final. We do not offer refunds on digital products. However, if a product is detected or non-functional, time will be compensated." },
    { q: "Can I share my account with another user?", a: "No. Sharing your account is prohibited and may result in account deactivation." },
    { q: "What happens if a cheat gets detected?", a: "If a cheat gets detected, it will be temporarily disabled and updated. All affected subscription time will be compensated. Check the Status page for updates." },
    { q: "How do I reset my HWID?", a: "Create a support ticket with subject 'HWID Reset' and include your order ID. Our team will process the reset within 24 hours." },
    { q: "What is PRX?", a: "PRX is our internal currency. 100 PRX = $1 USD. You can top up PRX with real money and use it to purchase products. Volume bonuses up to 15% available." },
    { q: "How does the referral program work?", a: "Share your referral link. When someone signs up and makes purchases, you earn 10% of their spending as PRX — forever." },
    { q: "Do you accept resellers?", a: "Yes! We have a reseller program with 50% starting discount. Contact us through Discord or create a support ticket for more info." },
    { q: "How long until I receive my key?", a: "Keys are delivered instantly after purchase. Check your Dashboard to find your key." },
    { q: "What anti-cheats are bypassed?", a: "Our products are tested against BattlEye, EAC, Vanguard, Ricochet, and more. Check each product's page for specific compatibility." },
];

export default function FAQPage() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-3xl w-full">
                <div className="text-center mb-8">
                    <HelpCircle size={32} className="text-primary mx-auto mb-3" />
                    <h1 className="text-2xl font-bold mb-2">Frequently Asked Questions</h1>
                    <p className="text-sm text-muted-foreground">Find answers to common questions below.</p>
                </div>

                <div className="flex flex-col gap-2">
                    {faqs.map((f, i) => (
                        <div key={i} className="border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-muted/20 transition-colors"
                            >
                                <span className="text-sm font-medium pr-4">{f.q}</span>
                                <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
                            </button>
                            {open === i && (
                                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
