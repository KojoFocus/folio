import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Hey! Most businesses don't need 10 things — they need the right 2 or 3 moves, executed well. I'll help you figure out what those are for your situation. Tell me about your business: what do you do, who do you serve, and what feels like the biggest thing in the way right now?";

export default async function StrategyPage() {
  const session = await getServerSession(authOptions);
  return (
    <ChatInterface
      mode="strategy"
      initialMessage={INITIAL}
      userId={session?.user?.id}
    />
  );
}
