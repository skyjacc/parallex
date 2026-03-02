import Link from "next/link";
import { LogoFull } from "./Logo";

const nav = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Store" },
    { href: "/status", label: "Status" },
    { href: "/support", label: "Support" },
    { href: "/topup", label: "Top Up" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
];

const games = [
    "Rust", "Apex Legends", "Fortnite", "Valorant", "CS2",
    "EFT", "Rainbow Six", "PUBG", "DayZ", "COD BO7",
    "Roblox", "FiveM", "Spoofers", "Game Accounts",
];

export function Footer() {
    return (
        <footer className="border-t mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                    <Link href="/" className="mb-3 inline-block">
                        <LogoFull />
                    </Link>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        In any game with any cheat, it is possible to get your account blocked. Play as carefully as possible.
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                        We are proud to provide industry-leading game enhancements with instant delivery and 24/7 support.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-semibold mb-3">Navigation</h3>
                    <ul className="flex flex-col gap-1.5">
                        {nav.map((l) => (
                            <li key={l.href}><Link href={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold mb-3">Games</h3>
                    <ul className="flex flex-col gap-1.5">
                        {games.map((g) => (
                            <li key={g}><Link href="/shop" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{g}</Link></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold mb-3">Follow Us</h3>
                    <div className="flex flex-col gap-1.5">
                        <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Discord</a>
                        <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Telegram</a>
                    </div>
                    <h3 className="text-sm font-semibold mb-2 mt-6">Contact</h3>
                    <a href="mailto:support@parallax.cards" className="text-xs text-muted-foreground hover:text-foreground transition-colors">support@parallax.cards</a>
                </div>
            </div>
            <div className="border-t px-4 py-4 text-center text-[11px] text-muted-foreground">
                {new Date().getFullYear()} &copy; Parallax. All rights reserved.
            </div>
        </footer>
    );
}
