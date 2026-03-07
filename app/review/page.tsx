import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatInterface } from "@/components/chat-interface";

const INITIAL =
  "Upload your pitch deck to get started — click the **paperclip icon** or drag and drop a PDF or PPTX file. Pasting the content as text also works.\n\nOnce I have it, I'll give you an honest investor-grade critique: what's working, what's missing, and what would lose a VC in the first 60 seconds. Then I'll generate a fully revised version you can download.";

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
