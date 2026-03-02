"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HeadphonesIcon, Plus, Send, Loader2, MessageSquare, Clock, CheckCircle, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";

interface Ticket { id: string; subject: string; status: string; messageCount: number; createdAt: string; updatedAt: string }
interface Msg { id: string; content: string; senderName: string; senderRole: string; createdAt: string }

export default function SupportPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [ticketInfo, setTicketInfo] = useState<{ subject: string; status: string } | null>(null);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [creating, setCreating] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const loadTickets = useCallback(() => {
        fetch("/api/tickets").then((r) => r.json()).then((d) => { if (d.ok) setTickets(d.tickets); }).finally(() => setLoading(false));
    }, []);

    useEffect(() => { if (session?.user) loadTickets(); }, [session, loadTickets]);

    const openTicket = async (id: string) => {
        setActiveTicketId(id); setLoadingMsgs(true);
        const r = await fetch(`/api/tickets/${id}`);
        const d = await r.json();
        if (d.ok) { setMessages(d.messages); setTicketInfo({ subject: d.ticket.subject, status: d.ticket.status }); }
        setLoadingMsgs(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    // Poll for new messages
    useEffect(() => {
        if (!activeTicketId) return;
        const iv = setInterval(async () => {
            const r = await fetch(`/api/tickets/${activeTicketId}`);
            const d = await r.json();
            if (d.ok) setMessages(d.messages);
        }, 5000);
        return () => clearInterval(iv);
    }, [activeTicketId]);

    const sendMessage = async () => {
        if (!input.trim() || !activeTicketId) return;
        setSending(true);
        try {
            const r = await fetch(`/api/tickets/${activeTicketId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: input }) });
            const d = await r.json();
            if (d.ok) { setInput(""); openTicket(activeTicketId); }
            else toast.error(d.error);
        } catch { toast.error("Failed to send"); }
        setSending(false);
    };

    const createTicket = async () => {
        if (!newSubject.trim() || !newMessage.trim()) return;
        setCreating(true);
        try {
            const r = await fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: newSubject, message: newMessage }) });
            const d = await r.json();
            if (d.ok) { toast.success("Ticket created"); setCreateOpen(false); setNewSubject(""); setNewMessage(""); loadTickets(); openTicket(d.ticketId); }
            else toast.error(d.error);
        } catch { toast.error("Failed"); }
        setCreating(false);
    };

    if (!session?.user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <HeadphonesIcon size={48} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Sign in to access support</p>
                <button onClick={() => router.push("/auth/signin?callbackUrl=/support")} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 cursor-pointer">Sign In</button>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full flex-col items-center px-4 py-8">
            <div className="max-w-3xl w-full">
                {!activeTicketId ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-semibold flex items-center gap-2"><HeadphonesIcon size={24} className="text-primary" /> Support</h1>
                                <p className="text-sm text-muted-foreground mt-1">Create a ticket and our team will respond.</p>
                            </div>
                            <button onClick={() => setCreateOpen(true)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 cursor-pointer gap-2"><Plus size={16} /> New Ticket</button>
                        </div>

                        {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div> : tickets.length === 0 ? (
                            <div className="text-center py-16 border rounded-xl">
                                <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground mb-4">No tickets yet</p>
                                <button onClick={() => setCreateOpen(true)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 cursor-pointer gap-2"><Plus size={16} /> Create Ticket</button>
                            </div>
                        ) : (
                            <div className="border rounded-xl overflow-hidden divide-y">
                                {tickets.map((t) => (
                                    <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left px-4 py-3 hover:bg-muted/20 transition-colors flex items-center gap-3 cursor-pointer">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === "OPEN" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{t.subject}</p>
                                            <p className="text-xs text-muted-foreground">{t.messageCount} messages · {new Date(t.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.status === "OPEN" ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{t.status}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <button onClick={() => { setActiveTicketId(null); setMessages([]); setTicketInfo(null); }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"><ArrowLeft size={14} /> Back to tickets</button>

                        {ticketInfo && (
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">{ticketInfo.subject}</h2>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ticketInfo.status === "OPEN" ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{ticketInfo.status}</span>
                            </div>
                        )}

                        <div className="border rounded-xl overflow-hidden">
                            <div className="h-[400px] overflow-y-auto p-4 flex flex-col gap-3">
                                {loadingMsgs ? <div className="flex items-center justify-center flex-1"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div> : messages.map((m) => (
                                    <div key={m.id} className={`flex ${m.senderRole === "ADMIN" ? "justify-start" : "justify-end"}`}>
                                        <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${m.senderRole === "ADMIN" ? "bg-muted/30 border" : "bg-primary text-primary-foreground"}`}>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[10px] font-medium">{m.senderName}</span>
                                                {m.senderRole === "ADMIN" && <Shield size={10} className="text-primary" />}
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                            <p className={`text-[9px] mt-1 ${m.senderRole === "ADMIN" ? "text-muted-foreground/60" : "text-primary-foreground/60"}`}>{new Date(m.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>

                            {ticketInfo?.status === "OPEN" && (
                                <div className="border-t p-3 flex gap-2">
                                    <input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                                    <button onClick={sendMessage} disabled={sending || !input.trim()} className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground size-9 shrink-0 cursor-pointer hover:bg-primary/90 disabled:opacity-50">
                                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                </div>
                            )}
                            {ticketInfo?.status === "CLOSED" && (
                                <div className="border-t p-3 text-center text-xs text-muted-foreground">This ticket is closed</div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Create ticket modal */}
            {createOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateOpen(false)} />
                    <div className="relative z-50 bg-background border rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-hidden">
                        <div className="p-6 border-b"><h2 className="text-lg font-semibold">New Support Ticket</h2></div>
                        <div className="p-6 flex flex-col gap-4">
                            <div><label className="text-sm font-medium mb-1.5 block">Subject</label><input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="e.g. Key not working" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} /></div>
                            <div><label className="text-sm font-medium mb-1.5 block">Message</label><textarea className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring min-h-[100px] resize-none" placeholder="Describe your issue..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} /></div>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button onClick={() => setCreateOpen(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent h-9 px-4 cursor-pointer">Cancel</button>
                            <button onClick={createTicket} disabled={creating || !newSubject.trim() || !newMessage.trim()} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 cursor-pointer gap-2 disabled:opacity-50">
                                {creating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
