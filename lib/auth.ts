import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import { rateLimit } from "./rate-limit";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                login: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                const forwarded = req?.headers?.["x-forwarded-for"];
                let ip = (typeof forwarded === "string" ? forwarded : forwarded?.[0]) || "unknown";
                if (ip.includes(",")) ip = ip.split(",")[0].trim();

                if (!rateLimit(ip, 60 * 1000, 10)) {
                    throw new Error("Too many login attempts. Please wait a minute.");
                }

                const loginValue = (credentials as any)?.login || (credentials as any)?.email;
                const passwordValue = credentials?.password;

                if (!loginValue || !passwordValue) {
                    throw new Error("Please enter your email/username and password");
                }

                const login = loginValue.trim();

                try {
                    const user = login.includes("@")
                        ? await db.user.findUnique({ where: { email: login } })
                        : await db.user.findUnique({ where: { name: login } });

                    if (!user) {
                        throw new Error("Invalid credentials");
                    }

                    const isPasswordValid = await compare(passwordValue, user.password);

                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials");
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                        prxBalance: user.prxBalance,
                    };
                } catch (error) {
                    if (error instanceof Error && (
                        error.message === "Invalid credentials" ||
                        error.message.startsWith("Too many") ||
                        error.message.startsWith("Please")
                    )) {
                        throw error;
                    }
                    throw new Error("Unable to connect. Try again later.");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.prxBalance = (user as any).prxBalance;
            }
            if (trigger === "update") {
                const fresh = await db.user.findUnique({ where: { id: token.id as string }, select: { prxBalance: true, role: true } });
                if (fresh) {
                    token.prxBalance = fresh.prxBalance;
                    token.role = fresh.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).prxBalance = token.prxBalance;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
