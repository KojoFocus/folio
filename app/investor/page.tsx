import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Hey! Most founders who get rejected by investors aren't rejected because of a bad business — it's because they showed up before they were ready. I'll help you figure out exactly where you stand and what to tighten up before those first meetings. Tell me about what you're building.";

export default async function InvestorPage() {
  const session = await getServerSession(authOptions);
  return (
    <ChatInterface
      mode="investor"
      initialMessage={INITIAL}
      userId={session?.user?.id}
    />
  );
}
