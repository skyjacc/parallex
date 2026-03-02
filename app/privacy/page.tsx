import { Shield } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-3xl w-full">
                <div className="text-center mb-8">
                    <Shield size={32} className="text-primary mx-auto mb-3" />
                    <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-sm text-muted-foreground">Last Updated: March 2026</p>
                </div>

                <div className="flex flex-col gap-6 text-sm text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">1. Information We Collect</h2>
                        <p>We collect: email address, username, and payment transaction data (no card numbers are stored). We also collect log data such as IP address, browser type, and pages visited.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
                        <p>We use your information to: provide and maintain our service, process transactions, send notifications, provide customer support, and detect fraud.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">3. Data Sharing</h2>
                        <p>We do not sell, trade, or rent your personal information. Payment processing is handled by MoneyMotion — we never see or store your full card details.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">4. Security</h2>
                        <p>We use HTTPS, bcrypt password hashing, HMAC webhook verification, rate limiting, and security headers (CSP, HSTS, X-Frame-Options). All data is encrypted in transit.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">5. Cookies</h2>
                        <p>We use session cookies for authentication. No third-party tracking cookies are used.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">6. Data Retention</h2>
                        <p>Account data is retained as long as your account is active. You may request account deletion by contacting support.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">7. Changes</h2>
                        <p>We may update this policy. Changes will be posted on this page with an updated date.</p>
                    </section>
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-2">8. Contact</h2>
                        <p>For privacy questions, contact us at support@parallax.cards or create a support ticket.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
