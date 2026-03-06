import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Hey! Growth problems usually come down to one of three things — you're not getting enough people in, too many are dropping off before they buy, or the ones who do buy don't come back. Once we figure out which one it is, the path gets a lot clearer. What are you working on, and where does growth feel stuck right now?";

export default async function GrowthPage() {
  const session = await getServerSession(authOptions);
  return (
    <ChatInterface
      mode="growth"
      initialMessage={INITIAL}
      userId={session?.user?.id}
    />
  );
}
