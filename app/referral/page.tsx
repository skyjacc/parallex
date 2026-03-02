"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Gift, Copy, Check, Loader2, Users, Zap, Link2 } from "lucide-react";
import { toast } from "sonner";

interface ReferralData {
    referralCode: string;
    referralLink: string;
    totalReferrals: number;
    totalBonus: number;
    referrals: { userName: string; bonus: number; date: string }[];
}

export default function ReferralPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!session?.user) return;
        fetch("/api/referral").then((r) => r.json()).then((d) => { if (d.ok) setData(d); }).finally(() => setLoading(false));
    }, [session]);

    const copyLink = () => {
        if (data?.referralLink) {
            navigator.clipboard.writeText(data.referralLink);
            setCopied(true);
            toast.success("Referral link copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!session?.user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Gift size={48} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Sign in to access referrals</p>
                <button onClick={() => router.push("/auth/signin?callbackUrl=/referral")} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 cursor-pointer">Sign In</button>
            </div>
        );
    }

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

    if (!data) return <div className="text-center py-20 text-sm text-muted-foreground">Failed to load</div>;

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <Gift size={28} className="text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold mb-2">Refer & Earn</h1>
                    <p className="text-sm text-muted-foreground">
                        Share your link. Both you and your friend get <strong>50 PRX</strong> bonus.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl border bg-card p-5 text-center">
                        <Users size={20} className="text-primary mx-auto mb-2" />
                        <p className="text-2xl font-mono font-semibold">{data.totalReferrals}</p>
                        <p className="text-xs text-muted-foreground">Referrals</p>
                    </div>
                    <div className="rounded-xl border bg-card p-5 text-center">
                        <Zap size={20} className="text-primary mx-auto mb-2" />
                        <p className="text-2xl font-mono font-semibold">{data.totalBonus}</p>
                        <p className="text-xs text-muted-foreground">PRX Earned</p>
                    </div>
                    <div className="rounded-xl border bg-card p-5 text-center">
                        <Gift size={20} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-2xl font-mono font-semibold">50</p>
                        <p className="text-xs text-muted-foreground">PRX per Invite</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 mb-6">
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2"><Link2 size={14} /> Your Referral Link</label>
                    <div className="flex gap-2">
                        <code className="flex-1 bg-muted/30 border rounded-lg px-4 py-3 font-mono text-sm break-all">{data.referralLink}</code>
                        <button onClick={copyLink} className="inline-flex items-center justify-center rounded-md border hover:bg-accent size-11 transition-all cursor-pointer shrink-0">
                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Code: <code className="bg-muted/40 px-1.5 py-0.5 rounded">{data.referralCode}</code></p>
                </div>

                {data.referrals.length > 0 && (
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <div className="p-4 border-b"><h3 className="text-sm font-semibold">Referral History</h3></div>
                        <div className="divide-y">
                            {data.referrals.map((r, i) => (
                                <div key={i} className="px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{r.userName}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-sm font-mono text-emerald-400 flex items-center gap-1"><Zap size={12} />+{r.bonus} PRX</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
