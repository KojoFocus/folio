import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Hey! Let's build your deck. Give me whatever you've got — even a rough description of your idea is enough to start. The more context you share (problem, solution, market, traction, team, raise amount), the sharper the output. What are you working on?";

export default async function BuildPage() {
  const session = await getServerSession(authOptions);
  return (
    <ChatInterface
      mode="build"
      initialMessage={INITIAL}
      userId={session?.user?.id}
    />
  );
}
