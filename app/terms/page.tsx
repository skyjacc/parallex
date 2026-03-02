import { ScrollText } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-3xl w-full prose prose-invert prose-sm">
                <div className="text-center mb-8 not-prose">
                    <ScrollText size={32} className="text-primary mx-auto mb-3" />
                    <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
                    <p className="text-sm text-muted-foreground">Last Updated: March 2026</p>
                </div>

                <div className="flex flex-col gap-6 text-sm text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
                        <p>By using Parallax, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">2. Product Usage</h2>
                        <p>All products are licensed for personal, non-commercial use only. You may not redistribute, resell, or share product keys unless authorized as a reseller. Each key is bound to one user/device.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">3. Account Rules</h2>
                        <p>You may only use one account. Sharing accounts is prohibited. Accounts may be deactivated for: sharing, chargebacks, misuse, abuse, or working for anti-cheat organizations.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">4. Payment Policy</h2>
                        <p>All payments are processed securely through our payment providers. Fraudulent charges will result in permanent account termination. All deposits are credited as PRX balance.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">5. Refund Policy</h2>
                        <p>All sales are final. No refunds are provided for digital products. If a product becomes non-functional due to detection, subscription time will be compensated.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">6. Detection and Compensation</h2>
                        <p>We test all products against major anti-cheat systems. If a product is detected, it will be updated. Downtime is always compensated with additional subscription time.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">7. Disclaimer</h2>
                        <p>All products are provided &quot;as is.&quot; Parallax is not responsible for any consequences resulting from using our products, including game bans. Use at your own risk.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">8. Liability</h2>
                        <p>Parallax shall not be liable for any damages arising from the use of our products or services. You are solely responsible for your gaming activities.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">9. Changes</h2>
                        <p>We may update these terms at any time. Continued use of the service constitutes acceptance of updated terms.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
