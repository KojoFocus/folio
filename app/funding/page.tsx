import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Hey! So there's actually a lot of funding out there for SMEs and startups — grants, accelerators, impact investors, government programs — but most founders either don't know about them or apply to the wrong ones. I'll help you find what actually fits your situation. To point you in the right direction, where are you based, and what does your business do?";

export default async function FundingPage() {
  const session = await getServerSession(authOptions);
  return (
    <ChatInterface
      mode="funding"
      initialMessage={INITIAL}
      userId={session?.user?.id}
    />
  );
}
