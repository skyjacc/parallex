import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        // ── Validation ──────────────────────────────────────────
        if (!email || !password) {
            return NextResponse.json(
                { ok: false, error: "Email and password are required" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { ok: false, error: "Invalid email format" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { ok: false, error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const username = (name || email.split("@")[0]).trim();

        if (username.length < 2) {
            return NextResponse.json(
                { ok: false, error: "Username must be at least 2 characters" },
                { status: 400 }
            );
        }

        if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
            return NextResponse.json(
                { ok: false, error: "Username can only contain letters, numbers, dots, dashes and underscores" },
                { status: 400 }
            );
        }

        // ── Check duplicates ────────────────────────────────────
        const existingEmail = await db.user.findUnique({
            where: { email },
        });
        if (existingEmail) {
            return NextResponse.json(
                { ok: false, error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        const existingName = await db.user.findUnique({
            where: { name: username },
        });
        if (existingName) {
            return NextResponse.json(
                { ok: false, error: "This username is already taken" },
                { status: 409 }
            );
        }

        // ── Create user ─────────────────────────────────────────
        const hashedPassword = await hash(password, 12);

        const user = await db.user.create({
            data: {
                email,
                name: username,
                password: hashedPassword,
                prxBalance: 100, // Welcome bonus
            },
        });

        return NextResponse.json(
            {
                ok: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                message: "Account created! Welcome bonus: 100 PRX",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);

        // Prisma unique constraint
        if (error?.code === "P2002") {
            const field = error.meta?.target?.[0] || "field";
            return NextResponse.json(
                { ok: false, error: `This ${field} is already in use` },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { ok: false, error: "Server error. Please try again later." },
            { status: 500 }
        );
    }
}
