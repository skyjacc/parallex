"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
    return (
        <Suspense>
            <SignInForm />
        </Suspense>
    );
}

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    let callbackUrl = searchParams.get("callbackUrl") || "/";
    if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
        callbackUrl = "/";
    }

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                login,
                password,
                redirect: false,
            });

            if (result?.error) {
                // NextAuth passes the thrown Error.message in result.error
                const msg = decodeURIComponent(result.error);
                if (msg === "CredentialsSignin") {
                    setError("Invalid email/username or password");
                } else {
                    setError(msg);
                }
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
            {/* Close button */}
            <Link
                href="/"
                className="absolute top-4 right-4 rounded-full p-2 hover:bg-muted transition-colors z-50"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </Link>

            <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <Link href="/" className="flex gap-2 mb-2">
                                <span className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                                    <span className="text-background font-black text-lg">P</span>
                                </span>
                            </Link>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/auth/signup" className="underline underline-offset-4">Sign up</Link>
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 text-center bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <label className="text-sm font-medium" htmlFor="login">Email or Username</label>
                                <input
                                    className="placeholder:text-muted-foreground border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                    id="login"
                                    placeholder="user@parallax.gg or Admin"
                                    required
                                    type="text"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-3">
                                <label className="text-sm font-medium" htmlFor="password">Password</label>
                                <input
                                    className="placeholder:text-muted-foreground border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                    id="password"
                                    placeholder="••••••••"
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 w-full cursor-pointer transition-all disabled:opacity-50"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </div>

                        {/* The Google button was removed due to lack of provider setup */}
                    </div>
                </form>

                <div className="text-muted-foreground text-center text-xs text-balance">
                    By clicking continue, you agree to our{" "}
                    <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>.
                </div>
            </div>
        </div>
    );
}
