import Link from "next/link";
import { ArrowLeft, MessageSquareDashed } from "lucide-react";

interface Conversation {
  id:    string;
  title: string;
  mode:  "build" | "review" | "financial";
}

async function fetchConversation(id: string): Promise<Conversation | null> {
  // Use absolute URL — this runs on the server during RSC render
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/conversations/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<Conversation>;
  } catch {
    return null;
  }
}

// ── Empty / 404 state ──────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-field-800 px-5 py-3.5">
        <Link href="/dashboard" className="text-field-600 hover:text-field-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="font-serif text-sm font-semibold text-field-300">Folio</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-field-800 bg-field-900">
          <MessageSquareDashed className="h-6 w-6 text-field-600" />
        </div>

        <div className="space-y-1">
          <p className="font-serif text-lg font-semibold text-field-200">
            Session not found
          </p>
          <p className="text-sm text-field-500">
            This conversation doesn&apos;t exist or was removed.
          </p>
        </div>

        <Link
          href="/build"
          className="mt-2 rounded-lg bg-sage-400 px-4 py-2 text-sm font-semibold text-field-950 hover:bg-sage-300 transition-colors"
        >
          Start a new session
        </Link>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }         = await params;
  const conversation   = await fetchConversation(id);

  if (!conversation) return <EmptyState />;

  // TODO: render full ChatInterface with pre-loaded messages once DB is wired
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-field-800 px-5 py-3.5">
        <Link href="/dashboard" className="text-field-600 hover:text-field-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="font-serif text-sm font-semibold text-field-300">Folio</span>
        <span className="text-field-700">/</span>
        <span className="text-sm text-field-500 truncate">{conversation.title}</span>
      </header>

      <div className="flex flex-1 items-center justify-center text-sm text-field-600">
        Conversation rendering coming soon.
      </div>
    </div>
  );
}
