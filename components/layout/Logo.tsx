"use client";

/**
 * Parallax Logo — geometric layered "P" with parallax shift effect.
 * Three stacked diagonal planes creating depth, with a clean "P" cutout.
 */

export function LogoIcon({ size = 28, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect width="32" height="32" rx="8" fill="currentColor" />
            {/* Three parallel diagonal lines — parallax layers */}
            <path d="M8 24L14 8" stroke="var(--background, #000)" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
            <path d="M12 24L18 8" stroke="var(--background, #000)" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
            {/* Letter P — bold geometric */}
            <path
                d="M13 22V10H17.5C19.985 10 22 11.79 22 14C22 16.21 19.985 18H13"
                stroke="var(--background, #000)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Accent dot — like a crosshair/target nod */}
            <circle cx="24" cy="24" r="1.5" fill="var(--primary, #6366f1)" />
        </svg>
    );
}

export function LogoFull({ className = "" }: { className?: string }) {
    return (
        <span className={`flex gap-2 items-center text-foreground font-bold text-lg ${className}`}>
            <LogoIcon size={28} />
            <span className="truncate tracking-tight">Parallax</span>
        </span>
    );
}

export function LogoCollapsed({ className = "" }: { className?: string }) {
    return <LogoIcon size={32} className={`text-foreground ${className}`} />;
}
