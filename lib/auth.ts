import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
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
            async authorize(credentials) {
                // Accept both "login" and "email" field names
                const loginValue = (credentials as any)?.login || (credentials as any)?.email;
                const passwordValue = credentials?.password;

                if (!loginValue || !passwordValue) {
                    throw new Error("Please enter your email/username and password");
                }

                const login = loginValue.trim();

                try {
                    // Try email first, then username
                    const user = login.includes("@")
                        ? await db.user.findUnique({ where: { email: login } })
                        : await db.user.findUnique({ where: { name: login } });

                    if (!user) {
                        throw new Error("No account found with this email or username");
                    }

                    const isPasswordValid = await compare(passwordValue, user.password);

                    if (!isPasswordValid) {
                        throw new Error("Incorrect password");
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
                    if (error instanceof Error && error.message.startsWith("No account") || error instanceof Error && error.message.startsWith("Incorrect") || error instanceof Error && error.message.startsWith("Please")) {
                        throw error;
                    }
                    throw new Error("Unable to connect to database. Try again later.");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.prxBalance = (user as any).prxBalance;
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
