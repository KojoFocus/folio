import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Hey! Numbers don't have to be scary — I promise. I'm going to help you build a simple financial model that shows where your business actually stands and where it's heading. We'll go through it together, one thing at a time, in plain language. So — tell me about your business. What do you do, and how's it going so far?";

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
