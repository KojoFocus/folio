"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FileText, Copy, Check, Pencil, X,
  PanelLeft, Plus, MessageSquare, Trash2,
  Presentation, Search, TrendingUp, Megaphone, Compass, Star, Rocket, CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatInput, type Attachment } from "@/components/chat/ChatInput";
import { DeckCard } from "@/components/chat/DeckCard";
import { FinancialCard } from "@/components/chat/FinancialCard";
import type { FinancialAssumptions } from "@/lib/financial";

interface DeckMeta {
  url:        string;
  filename:   string;
  slideCount: number;
}

interface Message {
  role:        "user" | "assistant";
  content:     string;
  attachments?: Omit<Attachment, "id">[];
  deck?:       DeckMeta;
  financial?:  FinancialAssumptions;
}

export type ChatMode = "build" | "review" | "financial" | "marketing" | "strategy" | "investor" | "growth" | "funding";

const MODE_LABELS: Record<ChatMode, string> = {
  build:     "Pitch Deck",
  review:    "Deck Review",
  financial: "Financial Model",
  marketing: "Marketing Plan",
  strategy:  "Business Strategy",
  investor:  "Investor Readiness",
  growth:    "Growth Strategy",
  funding:   "Funding Finder",
};

const RELATED_TOOLS: Record<ChatMode, { href: string; label: string; icon: React.ElementType }[]> = {
  build:     [
    { href: "/review",    label: "Review a Deck",       icon: Search       },
    { href: "/financial", label: "Financial Model",      icon: TrendingUp   },
    { href: "/strategy",  label: "Business Strategy",    icon: Compass      },
  ],
  review:    [
    { href: "/build",     label: "Build New Deck",       icon: Presentation },
    { href: "/investor",  label: "Investor Readiness",   icon: Star         },
  ],
  financial: [
    { href: "/strategy",  label: "Business Strategy",    icon: Compass      },
    { href: "/investor",  label: "Investor Readiness",   icon: Star         },
  ],
  marketing: [
    { href: "/strategy",  label: "Business Strategy",    icon: Compass      },
    { href: "/build",     label: "Pitch Deck",           icon: Presentation },
  ],
  strategy:  [
    { href: "/financial", label: "Financial Model",      icon: TrendingUp   },
    { href: "/marketing", label: "Marketing Plan",       icon: Megaphone    },
    { href: "/investor",  label: "Investor Readiness",   icon: Star         },
  ],
  investor:  [
    { href: "/build",     label: "Pitch Deck",           icon: Presentation },
    { href: "/financial", label: "Financial Model",      icon: TrendingUp   },
    { href: "/growth",    label: "Growth Strategy",      icon: Rocket       },
  ],
  growth:    [
    { href: "/marketing", label: "Marketing Plan",       icon: Megaphone         },
    { href: "/strategy",  label: "Business Strategy",    icon: Compass           },
    { href: "/funding",   label: "Funding Finder",       icon: CircleDollarSign  },
  ],
  funding:   [
    { href: "/investor",  label: "Investor Readiness",   icon: Star              },
    { href: "/build",     label: "Pitch Deck",           icon: Presentation      },
    { href: "/financial", label: "Financial Model",      icon: TrendingUp        },
  ],
};

interface HistoryItem {
  id: string;
  title: string | null;
  updatedAt: string;
}

interface Props {
  mode:           ChatMode;
  initialMessage: string;
  userId?:        string;
}

function renderParts(line: string) {
  // Split on **bold**, [text](url) markdown links, and bare https:// URLs
  return line
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|https?:\/\/[^\s)]+)/g)
    .map((token, j) => {
      if (token.startsWith("**") && token.endsWith("**"))
        return <strong key={j} className="text-field-100">{token.slice(2, -2)}</strong>;
      const mdLink = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (mdLink)
        return (
          <a key={j} href={mdLink[2]} target="_blank" rel="noopener noreferrer"
            className="text-sage-400 underline decoration-sage-700/50 hover:text-sage-300 break-all">
            {mdLink[1]}
          </a>
        );
      if (/^https?:\/\//.test(token))
        return (
          <a key={j} href={token} target="_blank" rel="noopener noreferrer"
            className="text-sage-400 underline decoration-sage-700/50 hover:text-sage-300 break-all">
            {token}
          </a>
        );
      return token;
    });
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = renderParts(line);
    const partsWithoutLeadingDash = renderParts(line.replace(/^[-•]\s/, ""));

    if (line.startsWith("## ") || line.startsWith("# ")) {
      return <p key={i} className="mt-4 font-semibold text-field-100">{renderParts(line.replace(/^#{1,2} /, ""))}</p>;
    }
    // Top-level bullets
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-2 text-field-300">
          <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-field-600" />
          <span>{partsWithoutLeadingDash}</span>
        </div>
      );
    }
    // Indented bullets (tab or 2+ spaces + "- " / "* " / "• ")
    const indented = line.match(/^(?:\t+|\s{2,})[*\-•]\s(.*)$/);
    if (indented) {
      return (
        <div key={i} className="ml-4 flex gap-2 text-field-400">
          <span className="mt-[0.45rem] h-[3px] w-[3px] shrink-0 rounded-full bg-field-700" />
          <span>{renderParts(indented[1])}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) return <p key={i} className="text-field-300">{parts}</p>;
    if (line === "")            return <div key={i} className="h-2" />;
    return <p key={i} className="text-field-300">{parts}</p>;
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-field-600 transition-colors hover:bg-field-800 hover:text-field-400"
    >
      {copied
        ? <><Check className="h-3 w-3" /> Copied</>
        : <><Copy className="h-3 w-3" /> Copy</>
      }
    </button>
  );
}

export function ChatInterface({ mode, initialMessage, userId }: Props) {
  const [messages,    setMessages]   = useState<Message[]>([{ role: "assistant", content: initialMessage }]);
  const [streaming,   setStreaming]  = useState(false);
  const [editingIdx,  setEditingIdx] = useState<number | null>(null);
  const [editDraft,   setEditDraft]  = useState("");
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [history,       setHistory]       = useState<HistoryItem[]>([]);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [activeConvId,  setActiveConvId]  = useState<string | null>(null);
  const convIdRef   = useRef<string | null>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const editAreaRef = useRef<HTMLTextAreaElement>(null);

  // Persist sidebar open state
  useEffect(() => {
    const saved = localStorage.getItem("chat-sidebar-open");
    if (saved === "false") setSidebarOpen(false);
  }, []);

  function toggleSidebar() {
    setSidebarOpen((o) => {
      localStorage.setItem("chat-sidebar-open", String(!o));
      return !o;
    });
  }

  // Fetch history for this mode
  function refreshHistory() {
    if (!userId) return;
    fetch("/api/conversations")
      .then((r) => r.ok ? r.json() : [])
      .then((data: (HistoryItem & { mode: string })[]) =>
        setHistory(data.filter((c) => c.mode === mode))
      )
      .catch(() => {});
  }

  useEffect(refreshHistory, [userId, mode]);

  // Load an existing conversation
  async function loadConversation(id: string) {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) return;
      const data = await res.json() as { messages: Message[] };
      setMessages(data.messages.length ? data.messages : [{ role: "assistant", content: initialMessage }]);
      convIdRef.current = id;
      setActiveConvId(id);
    } catch { /* ignore */ }
  }

  // Start a fresh conversation
  function newConversation() {
    setMessages([{ role: "assistant", content: initialMessage }]);
    convIdRef.current = null;
    setActiveConvId(null);
  }

  async function deleteHistoryItem(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setHistory((h) => h.filter((x) => x.id !== id));
      if (activeConvId === id) newConversation();
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (editingIdx !== null && editAreaRef.current) {
      editAreaRef.current.focus();
      editAreaRef.current.setSelectionRange(editDraft.length, editDraft.length);
    }
  }, [editingIdx, editDraft.length]);

  async function sendFrom(history: Message[], text: string, attachments: Attachment[]) {
    const userMsg: Message = {
      role: "user",
      content: text,
      attachments: attachments.length
        ? attachments.map(({ name, type, data, dataUrl, size }) => ({ name, type, data, dataUrl, size }))
        : undefined,
    };

    const next = [...history, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: next.map((m) => ({
            role: m.role,
            content: m.content,
            files: m.attachments?.map((a) => ({ name: a.name, type: a.type, data: a.data })),
          })),
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader    = res.body.getReader();
      const decoder   = new TextDecoder();
      let sseBuffer   = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const events = sseBuffer.split("\n\n");
        sseBuffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          const raw = event.slice(6).trim();
          if (raw === "[DONE]") break;
          try {
            const parsed = JSON.parse(raw) as {
              t: string;
              v?: string;
              url?: string;
              filename?: string;
              slideCount?: number;
              message?: string;
              data?: FinancialAssumptions;
            };
            if (parsed.t === "error") {
              const errMsg = parsed.message ?? "Something went wrong. Please try again.";
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: errMsg };
                return copy;
              });
            } else if (parsed.t === "delta" && parsed.v) {
              accumulated += parsed.v;
              const snap = accumulated;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: snap };
                return copy;
              });
            } else if (parsed.t === "deck" && parsed.url) {
              const deck: DeckMeta = {
                url:        parsed.url,
                filename:   parsed.filename ?? "pitch-deck.pptx",
                slideCount: parsed.slideCount ?? 0,
              };
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { ...copy[copy.length - 1], deck };
                return copy;
              });
            } else if (parsed.t === "financial" && parsed.data) {
              const financial = parsed.data;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { ...copy[copy.length - 1], financial };
                return copy;
              });
            }
          } catch { /* malformed chunk — skip */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: "Something went wrong. Please try again." };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }

    // Save conversation to DB (fire-and-forget)
    if (userId) {
      setMessages((current) => {
        const raw = current.find((m) => m.role === "user")?.content?.trim() ?? "";
        // Trim at a word boundary, max 70 chars
        const title = raw.length <= 70
          ? raw || null
          : (raw.slice(0, 70).replace(/\s+\S*$/, "") || raw.slice(0, 70)) + "…";
        const payload = current.map(({ role, content }) => ({ role, content }));
        fetch("/api/conversations", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            id:       convIdRef.current,
            mode,
            title,
            messages: payload,
          }),
        })
          .then((r) => r.json())
          .then(({ id }) => {
            if (id) { convIdRef.current = id; setActiveConvId(id); refreshHistory(); }
          })
          .catch(() => {});
        return current;
      });
    }
  }

  function send(text: string, attachments: Attachment[]) {
    sendFrom(messages, text, attachments);
  }

  function stop() { abortRef.current?.abort(); }

  function startEdit(idx: number) {
    setEditDraft(messages[idx].content);
    setEditingIdx(idx);
  }

  function cancelEdit() {
    setEditingIdx(null);
    setEditDraft("");
  }

  function submitEdit() {
    if (editingIdx === null || !editDraft.trim()) return;
    // Keep all messages before the edited message, then re-send
    const history = messages.slice(0, editingIdx);
    setEditingIdx(null);
    setEditDraft("");
    sendFrom(history, editDraft, []);
  }

  return (
    <div className="flex h-screen bg-field-950">

      {/* ── In-chat sidebar ─────────────────────────────────────────────── */}
      <aside className={cn(
        "flex flex-col shrink-0 border-r border-field-800 bg-field-950 transition-[width] duration-200 overflow-hidden",
        sidebarOpen ? "w-52" : "w-0",
      )}>
        <div className="flex h-12 items-center justify-between border-b border-field-800 px-3">
          <span className="font-serif text-xs font-semibold text-field-400">{MODE_LABELS[mode]}</span>
        </div>

        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {/* New conversation */}
          <button
            onClick={newConversation}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-field-500 hover:bg-field-900 hover:text-field-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New conversation
          </button>

          {/* History */}
          {history.length > 0 && (
            <>
              <p className="px-2.5 pt-3 pb-0.5 text-[9px] font-semibold uppercase tracking-widest text-field-700">
                History
              </p>
              {history.slice(0, 20).map((item) => (
                <div key={item.id} className="group relative flex items-center">
                  <button
                    onClick={() => loadConversation(item.id)}
                    className={cn(
                      "flex flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors min-w-0 text-left",
                      activeConvId === item.id
                        ? "bg-field-800 text-field-200"
                        : "text-field-600 hover:bg-field-900 hover:text-field-400",
                    )}
                  >
                    <MessageSquare className="h-3 w-3 shrink-0 opacity-40" />
                    <span className="flex-1 truncate">
                      {item.title ?? "Untitled session"}
                    </span>
                  </button>
                  <button
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    disabled={deletingId === item.id}
                    className="absolute right-1 hidden rounded p-0.5 text-field-700 hover:text-red-400 group-hover:flex"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Related tools */}
          <p className="px-2.5 pt-4 pb-0.5 text-[9px] font-semibold uppercase tracking-widest text-field-700">
            Related tools
          </p>
          {RELATED_TOOLS[mode].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-field-600 hover:bg-field-900 hover:text-field-300 transition-colors"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

      {/* Header */}
      <header className="flex items-center gap-3 border-b border-field-800 px-4 py-3.5">
        <button
          onClick={toggleSidebar}
          className="text-field-600 hover:text-field-300 transition-colors"
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <Link href="/dashboard" className="text-field-600 hover:text-field-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="font-serif text-sm font-semibold text-field-300">Folio</span>
        <span className="text-field-700">/</span>
        <span className="text-sm text-field-500">{MODE_LABELS[mode]}</span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn("group flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" ? (
                <div className="max-w-[90%] space-y-1 text-sm leading-relaxed">
                  {msg.content === "" && streaming
                    ? <span className="inline-block h-4 w-4 animate-pulse rounded bg-field-700" />
                    : renderContent(
                        msg.content
                          .replace(/<deck>[\s\S]*?<\/deck>/g, "")
                          .replace(/<financial>[\s\S]*?<\/financial>/g, "")
                          .trimEnd()
                      )
                  }
                  {msg.deck && (
                    <DeckCard
                      url={msg.deck.url}
                      filename={msg.deck.filename}
                      slideCount={msg.deck.slideCount}
                    />
                  )}
                  {msg.financial && <FinancialCard data={msg.financial} />}
                  {/* Copy button — only show when not streaming this message */}
                  {msg.content && !(streaming && i === messages.length - 1) && (
                    <div className="flex pt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <CopyButton
                        text={msg.content
                          .replace(/<deck>[\s\S]*?<\/deck>/g, "")
                          .replace(/<financial>[\s\S]*?<\/financial>/g, "")
                          .trimEnd()}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-[80%] space-y-2">
                  {msg.attachments?.length ? (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {msg.attachments.map((a, j) => (
                        <div key={j} className="flex items-center gap-1.5 rounded-lg border border-field-700 bg-field-900 px-2 py-1 text-xs text-field-400">
                          {a.type.startsWith("image/")
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={a.dataUrl} alt={a.name} className="h-5 w-5 rounded object-cover" />
                            : <FileText className="h-4 w-4 text-field-500" />
                          }
                          <span className="max-w-[120px] truncate">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {editingIdx === i ? (
                    /* Inline edit textarea */
                    <div className="space-y-1.5">
                      <textarea
                        ref={editAreaRef}
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEdit(); }
                          if (e.key === "Escape") cancelEdit();
                        }}
                        rows={Math.min(10, editDraft.split("\n").length + 1)}
                        className="w-full resize-none rounded-2xl border border-field-600 bg-field-800 px-4 py-2.5 text-sm text-field-200 outline-none focus:border-sage-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-field-500 hover:text-field-300 transition-colors"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                        <button
                          onClick={submitEdit}
                          disabled={!editDraft.trim()}
                          className="flex items-center gap-1 rounded-lg bg-sage-500 px-2.5 py-1 text-xs font-medium text-field-950 hover:bg-sage-400 disabled:opacity-40 transition-colors"
                        >
                          Resend
                        </button>
                      </div>
                    </div>
                  ) : (
                    msg.content && (
                      <div className="rounded-2xl bg-field-800 px-4 py-2.5 text-sm text-field-200 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    )
                  )}

                  {/* Copy + Edit actions */}
                  {editingIdx !== i && msg.content && !streaming && (
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <CopyButton text={msg.content} />
                      <button
                        onClick={() => startEdit(i)}
                        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-field-600 transition-colors hover:bg-field-800 hover:text-field-400"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput streaming={streaming} onSend={send} onStop={stop} />
      </div>{/* end main column */}
    </div>
  );
}
