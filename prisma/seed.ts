import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function generateKeys(prefix: string, count: number): string[] {
    return Array.from({ length: count }, (_, i) => {
        const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
        const hex2 = Math.random().toString(16).substring(2, 6).toUpperCase();
        return `${prefix}-${hex}-${hex2}-${String(i + 1).padStart(3, "0")}`;
    });
}

async function main() {
    console.log("🌱 Seeding database...\n");

    // ── Admin user
    const adminPassword = await hash("admin123", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@parallax.gg" },
        update: {},
        create: { email: "admin@parallax.gg", name: "Admin", password: adminPassword, role: "ADMIN", prxBalance: 99999 },
    });
    console.log(`✅ Admin: ${admin.email} / admin123`);

    // ── Test user
    const userPassword = await hash("user123", 12);
    const user = await prisma.user.upsert({
        where: { email: "user@parallax.gg" },
        update: {},
        create: { email: "user@parallax.gg", name: "TestUser", password: userPassword, role: "USER", prxBalance: 5000 },
    });
    console.log(`✅ User: ${user.email} / user123`);

    // ── Products with stock keys
    const productsData = [
        { name: "Valorant PRX", description: "Private aimbot + ESP with full Vanguard bypass. Daily updates, zero bans reported. Instant key delivery.", pricePrx: 350, prefix: "VAL-PRX", keys: 8 },
        { name: "Rust Dominator", description: "Full feature internal: aimbot, ESP, no-recoil, loot radar. Works on official & community servers.", pricePrx: 500, prefix: "RUST-DOM", keys: 5 },
        { name: "CS2 Lite", description: "Lightweight legit cheat with triggerbot, glow ESP, and bhop. Undetected on Faceit & Matchmaking.", pricePrx: 200, prefix: "CS2-LITE", keys: 12 },
        { name: "Fortnite Evo", description: "Softaim + player ESP + loot ESP. Compatible with latest season. Stream-proof overlay included.", pricePrx: 450, prefix: "FN-EVO", keys: 6 },
        { name: "Apex Predator", description: "Full-featured Apex cheat with aimbot, ESP, and recoil control. EAC bypass included.", pricePrx: 400, prefix: "APX-PRED", keys: 7 },
        { name: "PUBG Ghost", description: "Undetectable PUBG hack with aimbot, ESP, speed hack, and vehicle teleport.", pricePrx: 350, prefix: "PUBG-GH", keys: 4 },
        { name: "Tarkov Intel", description: "Loot ESP, player ESP, aimbot for Escape from Tarkov. BattlEye bypass included.", pricePrx: 600, prefix: "TRK-INT", keys: 3 },
        { name: "R6 Wallhax", description: "Wallhack, ESP, and no-recoil for Rainbow Six Siege. BattlEye undetected.", pricePrx: 300, prefix: "R6-WHX", keys: 6 },
        { name: "Overwatch Zenith", description: "Aimbot, ESP, triggerbot for Overwatch 2. Works in competitive and arcade.", pricePrx: 250, prefix: "OW2-ZEN", keys: 9 },
        { name: "DayZ Survivor", description: "ESP, aimbot, item ESP for DayZ. Works on official and modded servers.", pricePrx: 280, prefix: "DAYZ-SRV", keys: 5 },
        { name: "Warzone Ultra", description: "Premium Warzone hack: aimbot, wallhack, no recoil. Ricochet bypass included.", pricePrx: 550, prefix: "WZ-ULTR", keys: 4 },
        { name: "HWID Spoofer Pro", description: "Universal HWID spoofer. Works with all games. Serial, MAC, disk spoofing.", pricePrx: 150, prefix: "HWID-SPF", keys: 15 },
    ];

    for (const p of productsData) {
        const id = p.name.toLowerCase().replace(/\s+/g, "-");
        const existing = await prisma.product.findUnique({ where: { id } });

        if (!existing) {
            const keys = generateKeys(p.prefix, p.keys);
            await prisma.product.create({
                data: {
                    id,
                    name: p.name,
                    description: p.description,
                    pricePrx: p.pricePrx,
                    stocks: {
                        create: keys.map((content) => ({ content })),
                    },
                },
            });
            console.log(`✅ ${p.name} — ${p.keys} keys added`);
        } else {
            console.log(`⏭  ${p.name} — already exists`);
        }
    }

    // ── Payment Methods
    const paymentMethods = [
        { code: "moneymotion", name: "Card (MoneyMotion)", description: "Visa, Mastercard via MoneyMotion", icon: "moneymotion", enabled: true, sortOrder: 1 },
        { code: "stripe", name: "Card (Stripe)", description: "Visa, Mastercard, Amex via Stripe", icon: "stripe", enabled: true, sortOrder: 2 },
        { code: "paypal", name: "PayPal", description: "Pay with your PayPal account", icon: "paypal", enabled: false, sortOrder: 3 },
        { code: "crypto", name: "Cryptocurrency", description: "Bitcoin, Ethereum, Litecoin", icon: "crypto", enabled: true, sortOrder: 4 },
    ];

    for (const pm of paymentMethods) {
        await prisma.paymentMethod.upsert({
            where: { code: pm.code },
            update: {},
            create: pm,
        });
    }
    console.log(`✅ ${paymentMethods.length} payment methods seeded`);

    console.log("\n🎉 Seed complete!");
    console.log("─────────────────────────────────────");
    console.log("Admin:  Admin / admin123");
    console.log("User:   TestUser / user123 (5000 PRX)");
    console.log("─────────────────────────────────────");
}

main()
    .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
