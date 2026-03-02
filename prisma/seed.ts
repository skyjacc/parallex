import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function usd(dollars: number): number { return Math.round(dollars * 100); }

async function main() {
    console.log("Seeding database...\n");

    // ── Users ────────────────────────────────────────────────
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    const adminPw = await hash(adminPass, 12);
    await prisma.user.upsert({
        where: { email: "admin@parallax.gg" },
        update: {},
        create: { email: "admin@parallax.gg", name: "Admin", password: adminPw, role: "ADMIN", prxBalance: 99999, referralCode: "PARALLAX" },
    });

    const userPass = process.env.USER_PASSWORD || "user123";
    const userPw = await hash(userPass, 12);
    await prisma.user.upsert({
        where: { email: "user@parallax.gg" },
        update: {},
        create: { email: "user@parallax.gg", name: "TestUser", password: userPw, role: "USER", prxBalance: 5000 },
    });

    // ── Categories ───────────────────────────────────────────
    const cats = [
        { name: "Game Accounts", slug: "game-accounts", sortOrder: 1 },
        { name: "Spoofers", slug: "spoofers", sortOrder: 2 },
        { name: "Rust", slug: "rust", sortOrder: 3 },
        { name: "Arc Raiders", slug: "arc-raiders", sortOrder: 4 },
        { name: "DeadLock", slug: "deadlock", sortOrder: 5 },
        { name: "Apex Legends", slug: "apex-legends", sortOrder: 6 },
        { name: "COD Black Ops 7", slug: "cod-bo7", sortOrder: 7 },
        { name: "COD Black Ops 6", slug: "cod-bo6", sortOrder: 8 },
        { name: "Battlefield 6", slug: "battlefield-6", sortOrder: 9 },
        { name: "Fortnite", slug: "fortnite", sortOrder: 10 },
        { name: "Escape From Tarkov", slug: "eft", sortOrder: 11 },
        { name: "Rainbow Six", slug: "rainbow-six", sortOrder: 12 },
        { name: "Valorant", slug: "valorant", sortOrder: 13 },
        { name: "PUBG", slug: "pubg", sortOrder: 14 },
        { name: "DayZ", slug: "dayz", sortOrder: 15 },
        { name: "Delta Force", slug: "delta-force", sortOrder: 16 },
        { name: "Marvel Rivals", slug: "marvel-rivals", sortOrder: 17 },
        { name: "Arena Breakout Infinite", slug: "arena-breakout", sortOrder: 18 },
        { name: "Counter Strike 2", slug: "cs2", sortOrder: 19 },
        { name: "Unturned", slug: "unturned", sortOrder: 20 },
        { name: "FiveM", slug: "fivem", sortOrder: 21 },
        { name: "Roblox", slug: "roblox", sortOrder: 22 },
        { name: "COD Modern Warfare 3", slug: "cod-mw3", sortOrder: 23 },
        { name: "COD Modern Warfare 2", slug: "cod-mw2", sortOrder: 24 },
        { name: "Overwatch", slug: "overwatch", sortOrder: 25 },
        { name: "Battlebit", slug: "battlebit", sortOrder: 26 },
        { name: "The Finals", slug: "the-finals", sortOrder: 27 },
        { name: "Albion Online", slug: "albion-online", sortOrder: 28 },
        { name: "Hunt Showdown", slug: "hunt-showdown", sortOrder: 29 },
        { name: "Naraka", slug: "naraka", sortOrder: 30 },
        { name: "Scum", slug: "scum", sortOrder: 31 },
        { name: "Marathon", slug: "marathon", sortOrder: 32 },
    ];

    const catMap: Record<string, string> = {};
    for (const c of cats) {
        const cat = await prisma.category.upsert({
            where: { slug: c.slug },
            update: {},
            create: c,
        });
        catMap[c.slug] = cat.id;
    }
    console.log(`${cats.length} categories seeded`);

    // ── Products ─────────────────────────────────────────────
    const products: {
        name: string; desc: string; price: number; cat: string;
        type?: "INTERNAL" | "EXTERNAL" | "SPOOFER" | "SCRIPT" | "ACCOUNT" | "EXECUTOR";
        status?: "UNDETECTED" | "TESTING" | "UPDATING";
        keys?: number; featured?: boolean;
    }[] = [
        // Game Accounts
        { name: "EFT Temporary Account", desc: "Escape From Tarkov temporary account for cheating. Instant delivery.", price: 2.50, cat: "game-accounts", type: "ACCOUNT", keys: 20 },
        { name: "Rust Temporary Account", desc: "Rust temp account. Perfect for testing cheats without risking your main.", price: 1.50, cat: "game-accounts", type: "ACCOUNT", keys: 25 },
        { name: "Arc Raiders Temporary Account", desc: "Arc Raiders temp account with instant delivery.", price: 2.50, cat: "game-accounts", type: "ACCOUNT", keys: 15 },
        { name: "Phone Verified COD BO7 Account", desc: "Call of Duty Black Ops 7 phone verified temp account.", price: 1.00, cat: "game-accounts", type: "ACCOUNT", keys: 30 },
        { name: "CS2 Prime Temporary Account", desc: "Counter-Strike 2 Prime account. Ready for matchmaking.", price: 0.75, cat: "game-accounts", type: "ACCOUNT", keys: 40 },
        { name: "Battlefield 6 Temporary Account", desc: "Battlefield 6 temp account for cheating.", price: 2.00, cat: "game-accounts", type: "ACCOUNT", keys: 15 },
        { name: "DayZ Temporary Account", desc: "DayZ temp account. Instant delivery.", price: 2.00, cat: "game-accounts", type: "ACCOUNT", keys: 20 },
        { name: "Arc Raiders Full Access Account", desc: "Arc Raiders full access account. Permanent ownership.", price: 19.99, cat: "game-accounts", type: "ACCOUNT", keys: 5 },
        { name: "(Phone Verified) OW2/WZ2", desc: "Phone verified Overwatch 2 / Warzone 2 account.", price: 1.00, cat: "game-accounts", type: "ACCOUNT", keys: 30 },
        { name: "Rust Full Account", desc: "Rust full access account. Works on all servers.", price: 9.99, cat: "game-accounts", type: "ACCOUNT", keys: 10 },
        { name: "Valorant Ranked Accounts", desc: "Valorant ranked accounts. Various ranks available.", price: 4.00, cat: "game-accounts", type: "ACCOUNT", keys: 15 },
        { name: "Steam Accounts", desc: "Fresh Steam accounts. Bulk available.", price: 0.05, cat: "game-accounts", type: "ACCOUNT", keys: 100 },

        // Spoofers
        { name: "Reported Spoofer", desc: "HWID Spoofer for EAC, BattlEye, MRAC, ACE. Works for all cheats. Fortnite tournament support.", price: 19.99, cat: "spoofers", type: "SPOOFER", featured: true, keys: 10 },
        { name: "Exception Spoofer", desc: "Universal HWID spoofer. Intel & AMD. Win 10/11.", price: 5.00, cat: "spoofers", type: "SPOOFER", status: "TESTING", keys: 15 },
        { name: "Cheatvault Spoofer", desc: "Budget HWID spoofer. Serial, MAC, disk spoofing.", price: 2.00, cat: "spoofers", type: "SPOOFER", status: "TESTING", keys: 20 },

        // Rust
        { name: "FPS Rust Cheat", desc: "Internal Rust cheat. Safest option. Aimbot + ESP. Daily updates.", price: 5.99, cat: "rust", type: "INTERNAL", featured: true, keys: 8 },
        { name: "Serenity Rust Cheat", desc: "External Rust cheat. Aimbot, ESP, no-recoil. Undetected.", price: 4.99, cat: "rust", type: "EXTERNAL", keys: 10 },
        { name: "Ultimate Rust Cheat", desc: "External Rust cheat. Full feature set. Loot radar.", price: 6.99, cat: "rust", type: "EXTERNAL", keys: 6 },
        { name: "Astralis Rust Cheat", desc: "External Rust cheat. High accuracy aimbot.", price: 7.99, cat: "rust", type: "EXTERNAL", keys: 8 },
        { name: "Matrix Rust External", desc: "External Rust hack. Aimbot, ESP, no-recoil.", price: 7.99, cat: "rust", type: "EXTERNAL", keys: 6 },
        { name: "Hexwing Rust Internal", desc: "Internal Rust cheat. Win 10/11 x64.", price: 5.99, cat: "rust", type: "INTERNAL", status: "UPDATING", keys: 5 },
        { name: "Fluent Rust Cheat", desc: "Internal Rust cheat. Premium features.", price: 9.99, cat: "rust", type: "INTERNAL", status: "UPDATING", keys: 5 },
        { name: "Disconnect Rust Cheat", desc: "External Rust hack. Full feature.", price: 7.99, cat: "rust", type: "EXTERNAL", status: "TESTING", keys: 4 },

        // Arc Raiders
        { name: "Vertical Arc Raiders Cheat", desc: "External Arc Raiders cheat. ESP + Aimbot.", price: 4.99, cat: "arc-raiders", type: "EXTERNAL", keys: 6 },
        { name: "AFK Money & XP Bot", desc: "Arc Raiders AFK farming bot. Auto money and XP.", price: 2.99, cat: "arc-raiders", type: "SCRIPT", keys: 10 },
        { name: "Serenity Arc Raiders Cheat", desc: "External cheat. Undetected. Aimbot + ESP.", price: 4.00, cat: "arc-raiders", type: "EXTERNAL", keys: 8 },
        { name: "Crimson Arc Raiders Cheat", desc: "External hack. Aimbot, ESP, loot finder.", price: 7.99, cat: "arc-raiders", type: "EXTERNAL", keys: 5 },
        { name: "Spectrum Arc Raiders Cheat", desc: "Internal cheat. Full features.", price: 5.99, cat: "arc-raiders", type: "INTERNAL", keys: 6 },

        // DeadLock
        { name: "Predator DeadLock Cheat", desc: "Internal DeadLock cheat with built-in spoofer. Recommended.", price: 8.99, cat: "deadlock", type: "INTERNAL", featured: true, keys: 6 },

        // Apex Legends
        { name: "Aeon Apex Cheat", desc: "External Apex Legends cheat. Recommended. Aimbot + ESP.", price: 8.99, cat: "apex-legends", type: "EXTERNAL", featured: true, keys: 8 },
        { name: "FPS Apex Cheat", desc: "Internal Apex cheat. Safest option.", price: 5.99, cat: "apex-legends", type: "INTERNAL", keys: 6 },
        { name: "Spectrum Apex Cheat", desc: "Internal Apex hack. Full features.", price: 5.99, cat: "apex-legends", type: "INTERNAL", keys: 5 },
        { name: "Howlux Apex Cheat", desc: "External Apex cheat. Aimbot + ESP.", price: 4.99, cat: "apex-legends", type: "EXTERNAL", keys: 8 },
        { name: "Serenity Apex Cheat", desc: "External Apex hack with bunny-hop.", price: 3.99, cat: "apex-legends", type: "EXTERNAL", status: "UPDATING", keys: 6 },

        // COD BO7
        { name: "FPS COD BO7 Cheat", desc: "Internal Black Ops 7 cheat. Safest.", price: 5.99, cat: "cod-bo7", type: "INTERNAL", status: "UPDATING", keys: 6 },
        { name: "Spectrum COD BO7 Cheat", desc: "Internal BO7 hack.", price: 5.99, cat: "cod-bo7", type: "INTERNAL", keys: 5 },
        { name: "Howlux COD BO7 Cheat", desc: "External BO7 cheat with spoofer.", price: 4.99, cat: "cod-bo7", type: "EXTERNAL", keys: 8 },
        { name: "Serenity COD BO7 Cheat", desc: "External BO7 hack with spoofer.", price: 3.99, cat: "cod-bo7", type: "EXTERNAL", keys: 6 },

        // COD BO6
        { name: "Skyring COD BO6 Cheat", desc: "External BO6 hack. Stream proof.", price: 29.99, cat: "cod-bo6", type: "EXTERNAL", keys: 3 },
        { name: "Spectrum COD BO6 Cheat", desc: "Internal BO6 cheat. Recommended.", price: 5.99, cat: "cod-bo6", type: "INTERNAL", featured: true, keys: 5 },
        { name: "Serenity COD BO6 Cheat", desc: "External BO6 hack with spoofer + cleaner.", price: 3.99, cat: "cod-bo6", type: "EXTERNAL", keys: 6 },
        { name: "Howlux COD BO6 Cheat", desc: "External BO6 cheat with spoofer.", price: 4.99, cat: "cod-bo6", type: "EXTERNAL", keys: 8 },

        // Battlefield 6
        { name: "Serenity BF6 Cheat", desc: "External Battlefield 6 hack with spoofer.", price: 3.99, cat: "battlefield-6", type: "EXTERNAL", keys: 6 },
        { name: "Howlux BF6 Cheat", desc: "External BF6 cheat.", price: 7.99, cat: "battlefield-6", type: "EXTERNAL", status: "TESTING", keys: 4 },

        // Fortnite
        { name: "Satanova Fortnite Cheat", desc: "External Fortnite hack. Recommended. Aimbot + ESP.", price: 6.99, cat: "fortnite", type: "EXTERNAL", featured: true, keys: 10 },
        { name: "FPS Fortnite Cheat", desc: "Internal Fortnite cheat. Safest.", price: 5.99, cat: "fortnite", type: "INTERNAL", keys: 6 },
        { name: "Serenity Fortnite Cheat", desc: "External Fortnite hack. Aimbot + ESP.", price: 3.99, cat: "fortnite", type: "EXTERNAL", keys: 8 },
        { name: "Cobra Fortnite Cheat", desc: "External Fortnite hack. Budget option.", price: 3.99, cat: "fortnite", type: "EXTERNAL", keys: 10 },
        { name: "Howlux Fortnite Cheat", desc: "External Fortnite cheat. Full features.", price: 5.99, cat: "fortnite", type: "EXTERNAL", keys: 6 },
        { name: "Disconnect Fortnite Cheat", desc: "External Fortnite hack.", price: 8.99, cat: "fortnite", type: "EXTERNAL", status: "TESTING", keys: 4 },

        // EFT
        { name: "Next EFT Pro Cheat", desc: "External EFT cheat with spoofer. Recommended.", price: 6.99, cat: "eft", type: "EXTERNAL", featured: true, keys: 8 },
        { name: "Spectrum EFT Cheat", desc: "Internal Tarkov hack.", price: 5.99, cat: "eft", type: "INTERNAL", keys: 5 },
        { name: "Next EFT Lite Cheat", desc: "External Tarkov hack with spoofer. Budget.", price: 3.99, cat: "eft", type: "EXTERNAL", keys: 8 },
        { name: "Serenity EFT Cheat", desc: "External EFT cheat.", price: 3.00, cat: "eft", type: "EXTERNAL", keys: 6 },

        // Rainbow Six
        { name: "Cobra R6 Cheat", desc: "External R6 Siege cheat with spoofer. Aimbot + ESP.", price: 3.99, cat: "rainbow-six", type: "EXTERNAL", keys: 10 },
        { name: "Vega R6 Cheat", desc: "Internal R6 hack.", price: 4.99, cat: "rainbow-six", type: "INTERNAL", keys: 6 },
        { name: "Frost R6 Cheat", desc: "Internal R6 cheat with spoofer.", price: 9.99, cat: "rainbow-six", type: "INTERNAL", keys: 4 },
        { name: "Shark R6 Cheat", desc: "Internal R6 Siege hack.", price: 4.99, cat: "rainbow-six", type: "INTERNAL", keys: 8 },
        { name: "Serenity R6 Cheat", desc: "External R6 hack with spoofer.", price: 2.99, cat: "rainbow-six", type: "EXTERNAL", keys: 10 },
        { name: "Invision R6 Chams", desc: "R6 chams cheat with spoofer. Intel only.", price: 3.99, cat: "rainbow-six", type: "SPOOFER", keys: 6 },

        // Valorant
        { name: "Crimson Valorant Cheat", desc: "External Valorant hack. Vanguard bypass.", price: 7.99, cat: "valorant", type: "EXTERNAL", keys: 6 },
        { name: "Hydra Valorant Cheat", desc: "External Valorant hack. Aimbot + ESP.", price: 5.99, cat: "valorant", type: "EXTERNAL", keys: 5 },
        { name: "Satanova Valorant Pro", desc: "External Valorant hack. Premium.", price: 8.99, cat: "valorant", type: "EXTERNAL", keys: 4 },
        { name: "Inferra Valorant Aimbot", desc: "External aimbot + trigger for Valorant.", price: 5.99, cat: "valorant", type: "EXTERNAL", keys: 8 },
        { name: "Satanova Valorant Lite", desc: "External Valorant hack. Budget.", price: 5.99, cat: "valorant", type: "EXTERNAL", keys: 8 },
        { name: "Invision Valorant Cheat", desc: "External Valorant hack. Wide OS support.", price: 4.99, cat: "valorant", type: "EXTERNAL", keys: 5 },

        // PUBG
        { name: "Lightning PUBG Cheat", desc: "External PUBG hack with spoofer. Recommended.", price: 7.99, cat: "pubg", type: "EXTERNAL", featured: true, keys: 8 },
        { name: "Serenity PUBG Cheat", desc: "External PUBG hack.", price: 3.99, cat: "pubg", type: "EXTERNAL", keys: 10 },
        { name: "Spectrum PUBG Cheat", desc: "Internal PUBG hack.", price: 3.99, cat: "pubg", type: "INTERNAL", status: "UPDATING", keys: 5 },

        // DayZ
        { name: "Next DayZ Pro Cheat", desc: "External DayZ hack with spoofer. Recommended.", price: 5.99, cat: "dayz", type: "EXTERNAL", featured: true, keys: 8 },
        { name: "Spectrum DayZ Cheat", desc: "Internal DayZ hack.", price: 5.99, cat: "dayz", type: "INTERNAL", keys: 5 },
        { name: "Serenity DayZ Cheat", desc: "External DayZ hack.", price: 5.99, cat: "dayz", type: "EXTERNAL", keys: 6 },

        // Delta Force
        { name: "Howlux Delta Force Cheat", desc: "External Delta Force hack. Recommended.", price: 9.99, cat: "delta-force", type: "EXTERNAL", featured: true, keys: 4 },
        { name: "Serenity Delta Force Cheat", desc: "External Delta Force hack.", price: 3.99, cat: "delta-force", type: "EXTERNAL", status: "UPDATING", keys: 6 },

        // Marvel Rivals
        { name: "Dopa Marvel Rivals Cheat", desc: "External Marvel Rivals hack with spoofer. Recommended.", price: 4.99, cat: "marvel-rivals", type: "EXTERNAL", featured: true, keys: 8 },
        { name: "Serenity Marvel Rivals Cheat", desc: "External Marvel Rivals hack with spoofer.", price: 3.99, cat: "marvel-rivals", type: "EXTERNAL", status: "UPDATING", keys: 6 },

        // Arena Breakout
        { name: "Codax Arena Breakout Cheat", desc: "External Arena Breakout Infinite hack.", price: 7.99, cat: "arena-breakout", type: "EXTERNAL", keys: 5 },

        // CS2
        { name: "Memesense CS2 Cheat", desc: "Internal CS2 cheat. Semirage + HvH support.", price: 3.50, cat: "cs2", type: "INTERNAL", keys: 15 },
        { name: "Nixware CS2 Cheat", desc: "Internal CS2 hack. Semirage + HvH.", price: 1.00, cat: "cs2", type: "INTERNAL", keys: 20 },
        { name: "Predator CS2 Cheat", desc: "Internal CS2 hack. Budget option.", price: 1.50, cat: "cs2", type: "INTERNAL", keys: 20 },
        { name: "Skyring CS2 Cheat", desc: "External CS2 hack.", price: 12.00, cat: "cs2", type: "EXTERNAL", keys: 5 },

        // Unturned
        { name: "Serenity Unturned Cheat", desc: "External Unturned hack with spoofer.", price: 2.00, cat: "unturned", type: "EXTERNAL", keys: 10 },
        { name: "Howlux Unturned Cheat", desc: "External Unturned hack with spoofer.", price: 3.00, cat: "unturned", type: "EXTERNAL", keys: 8 },
        { name: "Hexwing Unturned Cheat", desc: "External Unturned hack.", price: 2.50, cat: "unturned", type: "EXTERNAL", keys: 8 },

        // FiveM
        { name: "Redengine Lua Executor", desc: "FiveM Lua executor. Works for all scripts.", price: 9.99, cat: "fivem", type: "EXECUTOR", keys: 6 },
        { name: "Nexus Redengine Premium", desc: "FiveM Lua menu. Premium cheat.", price: 9.99, cat: "fivem", type: "EXECUTOR", keys: 6 },
        { name: "Redengine FiveM Spoofer", desc: "FiveM HWID spoofer. All bans. CFX.RE global bans.", price: 7.99, cat: "fivem", type: "SPOOFER", keys: 5 },
        { name: "Super FiveM Spoofer", desc: "FiveM spoofer. All anticheats + CFX.RE bans.", price: 15.99, cat: "fivem", type: "SPOOFER", keys: 4 },

        // Roblox
        { name: "Wave Executor Windows/MAC", desc: "Roblox script executor. Recommended. Win + Mac.", price: 2.50, cat: "roblox", type: "EXECUTOR", featured: true, keys: 15 },

        // COD MW3
        { name: "Howlux COD MW3 Cheat", desc: "External MW3 hack.", price: 4.99, cat: "cod-mw3", type: "EXTERNAL", keys: 5 },

        // COD MW2
        { name: "Howlux COD MW2 Cheat", desc: "External MW2 hack.", price: 4.99, cat: "cod-mw2", type: "EXTERNAL", keys: 5 },

        // Overwatch
        { name: "Spectrum Overwatch Cheat", desc: "Internal Overwatch 2 hack. Recommended.", price: 5.99, cat: "overwatch", type: "INTERNAL", featured: true, keys: 5 },
        { name: "Hexwing Overwatch Cheat", desc: "External Overwatch 2 hack.", price: 9.99, cat: "overwatch", type: "EXTERNAL", keys: 4 },

        // Battlebit
        { name: "Howlux Battlebit Cheat", desc: "External Battlebit hack.", price: 6.99, cat: "battlebit", type: "EXTERNAL", keys: 4 },

        // The Finals
        { name: "Spectrum Finals Cheat", desc: "Internal The Finals hack.", price: 5.99, cat: "the-finals", type: "INTERNAL", keys: 5 },

        // Albion Online
        { name: "Serenity Albion Cheat", desc: "External Albion Online hack with spoofer.", price: 3.99, cat: "albion-online", type: "EXTERNAL", keys: 6 },

        // Hunt Showdown
        { name: "Serenity Hunt Showdown Cheat", desc: "External Hunt Showdown hack with spoofer.", price: 5.99, cat: "hunt-showdown", type: "EXTERNAL", keys: 5 },

        // Naraka
        { name: "Spectrum Naraka Cheat", desc: "Internal Naraka Bladepoint hack.", price: 3.99, cat: "naraka", type: "INTERNAL", keys: 5 },

        // Scum
        { name: "Next Scum Cheat", desc: "External SCUM hack with spoofer.", price: 3.99, cat: "scum", type: "EXTERNAL", keys: 5 },
    ];

    let created = 0;
    for (const p of products) {
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
        const existing = await prisma.product.findFirst({ where: { name: p.name } });

        if (!existing) {
            const keys = Array.from({ length: p.keys || 5 }, (_, i) => {
                const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
                return `${slug.slice(0, 8).toUpperCase()}-${hex}-${String(i + 1).padStart(3, "0")}`;
            });

            await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.desc,
                    pricePrx: usd(p.price),
                    categoryId: catMap[p.cat] || null,
                    cheatType: p.type || null,
                    detectionStatus: p.status || "UNDETECTED",
                    featured: p.featured || false,
                    stocks: { create: keys.map((content) => ({ content })) },
                },
            });
            created++;
        }
    }
    console.log(`${created} new products seeded (${products.length - created} already existed)`);

    // ── Payment Methods ──────────────────────────────────────
    const paymentMethods = [
        { code: "moneymotion", name: "Card (MoneyMotion)", description: "Visa, Mastercard via MoneyMotion", icon: "moneymotion", enabled: true, sortOrder: 1 },
        { code: "stripe", name: "Card (Stripe)", description: "Visa, Mastercard, Amex via Stripe", icon: "stripe", enabled: true, sortOrder: 2 },
        { code: "paypal", name: "PayPal", description: "Pay with your PayPal account", icon: "paypal", enabled: false, sortOrder: 3 },
        { code: "crypto", name: "Cryptocurrency", description: "Bitcoin, Ethereum, Litecoin", icon: "crypto", enabled: true, sortOrder: 4 },
    ];

    for (const pm of paymentMethods) {
        await prisma.paymentMethod.upsert({ where: { code: pm.code }, update: {}, create: pm });
    }

    // ── Sample Coupon ────────────────────────────────────────
    await prisma.coupon.upsert({
        where: { code: "WELCOME10" },
        update: {},
        create: { code: "WELCOME10", discountPercent: 10, maxUses: 100 },
    });

    console.log("\nSeed complete!");
}

main()
    .catch((e) => { console.error("Seed error:", e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
