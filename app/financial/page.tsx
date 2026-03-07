import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Let's build your financial model — no spreadsheets, no jargon. I'll ask you a few plain-English questions about your business, then generate a 3-year projection with revenue, costs, runway, break-even, and unit economics — downloadable as Excel.\n\nTo start: what does your business do, and are you pre-revenue or already generating income?";

export default async function FinancialPage() {
  const session = await getServerSession(authOptions);
  return (
    <ChatInterface
      mode="financial"
      initialMessage={INITIAL}
      userId={session?.user?.id}
    />
  );
}
