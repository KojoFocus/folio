import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Hey! A good marketing plan doesn't need a big budget — it needs the right channels for your specific audience. I'll build you a 90-day plan that's actually executable. What are you working on, and who are you trying to reach?";

export default async function MarketingPage() {
  const session = await getServerSession(authOptions);
  return (
    <ChatInterface
      mode="marketing"
      initialMessage={INITIAL}
      userId={session?.user?.id}
    />
  );
}
