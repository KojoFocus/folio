import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Paste your pitch deck content below — slide titles, bullet points, whatever you have. I'll give you an honest investor-grade review, then produce a fully revised version you can download.";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  return (
    <ChatInterface
      mode="review"
      initialMessage={INITIAL}
      userId={session?.user?.id}
    />
  );
}
