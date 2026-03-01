"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const errorMessages: Record<string, string> = {
    ConfigurationError: "Server configuration error. Please try again later or contact support.",
    CredentialsSignin: "Invalid email/username or password. Please try again.",
    SessionRequired: "You need to sign in to access this page.",
    OAuthSignin: "Error connecting to the authentication provider.",
    OAuthCallback: "Error during authentication callback.",
    OAuthCreateAccount: "Could not create an account with this provider.",
    Callback: "Authentication callback error.",
    AccessDenied: "Access denied. You don't have permission.",
    Verification: "The verification link has expired or is invalid.",
    Default: "An authentication error occurred. Please try again.",
};

export default function AuthErrorPage() {
    return (
        <Suspense>
            <AuthErrorContent />
        </Suspense>
    );
}

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const errorType = searchParams.get("error") || "Default";
    const message = errorMessages[errorType] || errorMessages.Default;

    return (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
            {/* Close button */}
            <Link
                href="/"
                className="absolute top-4 right-4 rounded-full p-2 hover:bg-muted transition-colors z-50"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Link>

            <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4 text-center">
                <div className="flex flex-col items-center gap-4">
                    <Link href="/" className="flex gap-2 mb-2">
                        <span className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                            <span className="text-background font-black text-lg">P</span>
                        </span>
                    </Link>

                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle size={28} className="text-red-500" />
                    </div>

                    <h1 className="text-xl font-semibold">Authentication Error</h1>

                    <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3 w-full">
                        {message}
                    </div>

                    <div className="flex gap-3 w-full">
                        <Link
                            href="/auth/signin"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 flex-1 transition-all"
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex-1 transition-all"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
