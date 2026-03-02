"use client";

import { useEffect, useState, useRef } from "react";
import { HeadphonesIcon, Send, Loader2, MessageSquare, X, Shield, Lock, Search } from "lucide-react";
import { toast } from "sonner";

interface Ticket { id: string; subject: string; status: string; userName: string; userEmail: string; messageCount: number; createdAt: string; updatedAt: string }
interface Msg { id: string; content: string; senderName: string; senderRole: string; createdAt: string }

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [ticketInfo, setTicketInfo] = useState<{ subject: string; status: string; userName: string } | null>(null);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [filter, setFilter] = useState<"all" | "OPEN" | "CLOSED">("all");
    const [search, setSearch] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    const loadTickets = () => { fetch("/api/tickets").then((r) => r.json()).then((d) => { if (d.ok) setTickets(d.tickets); }).finally(() => setLoading(false)); };
    useEffect(() => { loadTickets(); }, []);

    const openTicket = async (id: string) => {
        setActiveId(id); setLoadingMsgs(true);
        const r = await fetch(`/api/tickets/${id}`);
        const d = await r.json();
        if (d.ok) { setMessages(d.messages); setTicketInfo({ subject: d.ticket.subject, status: d.ticket.status, userName: d.ticket.userName }); }
        setLoadingMsgs(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    useEffect(() => {
        if (!activeId) return;
        const iv = setInterval(async () => { const r = await fetch(`/api/tickets/${activeId}`); const d = await r.json(); if (d.ok) setMessages(d.messages); }, 5000);
        return () => clearInterval(iv);
    }, [activeId]);

    const sendMessage = async () => {
        if (!input.trim() || !activeId) return;
        setSending(true);
        try {
            const r = await fetch(`/api/tickets/${activeId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: input }) });
            if ((await r.json()).ok) { setInput(""); openTicket(activeId); }
        } catch { toast.error("Failed"); }
        setSending(false);
    };

    const closeTicket = async () => {
        if (!activeId) return;
        await fetch(`/api/tickets/${activeId}`, { method: "PATCH" });
        toast.success("Ticket closed"); loadTickets(); setActiveId(null); setTicketInfo(null);
    };

    const openCount = tickets.filter((t) => t.status === "OPEN").length;
    const filtered = tickets.filter((t) => (filter === "all" || t.status === filter) && (t.subject.toLowerCase().includes(search.toLowerCase()) || t.userName.toLowerCase().includes(search.toLowerCase())));

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Total Tickets</p><p className="text-2xl font-mono font-semibold">{tickets.length}</p></div>
                <div className={`rounded-lg border p-4 ${openCount > 0 ? "border-emerald-500/20 bg-emerald-500/5" : "bg-card"}`}><p className="text-xs text-muted-foreground mb-1">Open</p><p className="text-2xl font-mono font-semibold">{openCount}</p></div>
                <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">Closed</p><p className="text-2xl font-mono font-semibold">{tickets.filter((t) => t.status === "CLOSED").length}</p></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:max-w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input className="border-input flex h-9 w-full rounded-md border bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-1">
                    {(["all", "OPEN", "CLOSED"] as const).map((f) => (
                        <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all cursor-pointer ${filter === f ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}>
                            {f === "all" ? "All" : f}{f === "OPEN" && openCount > 0 && <span className="ml-1.5 bg-emerald-500 text-black text-[10px] px-1.5 rounded-full">{openCount}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div> : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Ticket list */}
                    <div className="lg:col-span-2 border rounded-lg overflow-hidden divide-y max-h-[600px] overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12"><MessageSquare size={32} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No tickets</p></div>
                        ) : filtered.map((t) => (
                            <button key={t.id} onClick={() => openTicket(t.id)} className={`w-full text-left px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer ${activeId === t.id ? "bg-muted/20" : ""}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.status === "OPEN" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                                    <p className="text-sm font-medium truncate flex-1">{t.subject}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">{t.userName} · {t.messageCount} msgs · {new Date(t.updatedAt).toLocaleDateString()}</p>
                            </button>
                        ))}
                    </div>

                    {/* Chat panel */}
                    <div className="lg:col-span-3 border rounded-lg overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
                        {!activeId ? (
                            <div className="flex-1 flex items-center justify-center"><p className="text-sm text-muted-foreground">Select a ticket to view</p></div>
                        ) : loadingMsgs ? (
                            <div className="flex-1 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
                        ) : (
                            <>
                                <div className="border-b p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">{ticketInfo?.subject}</p>
                                        <p className="text-xs text-muted-foreground">{ticketInfo?.userName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {ticketInfo?.status === "OPEN" && (
                                            <button onClick={closeTicket} className="inline-flex items-center justify-center rounded-md text-xs font-medium border hover:bg-accent h-7 px-2.5 gap-1 cursor-pointer"><Lock size={12} /> Close</button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                                    {messages.map((m) => (
                                        <div key={m.id} className={`flex ${m.senderRole === "ADMIN" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${m.senderRole === "ADMIN" ? "bg-primary text-primary-foreground" : "bg-muted/30 border"}`}>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="text-[10px] font-medium">{m.senderName}</span>
                                                    {m.senderRole === "ADMIN" && <Shield size={10} />}
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                                <p className={`text-[9px] mt-1 ${m.senderRole === "ADMIN" ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>{new Date(m.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={bottomRef} />
                                </div>

                                {ticketInfo?.status === "OPEN" && (
                                    <div className="border-t p-3 flex gap-2">
                                        <input className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring" placeholder="Reply as admin..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                                        <button onClick={sendMessage} disabled={sending || !input.trim()} className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground size-9 shrink-0 cursor-pointer hover:bg-primary/90 disabled:opacity-50">
                                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        </button>
                                    </div>
                                )}
                                {ticketInfo?.status === "CLOSED" && (
                                    <div className="border-t p-3 text-center text-xs text-muted-foreground">Ticket closed</div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
