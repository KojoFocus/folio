// Shown automatically by Next.js while page.tsx is fetching the conversation.

function SkeletonBubble({ align, wide }: { align: "left" | "right"; wide?: boolean }) {
  return (
    <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div
        className={`animate-pulse rounded-2xl bg-field-800 ${wide ? "h-16 w-64" : "h-10 w-44"}`}
      />
    </div>
  );
}

export default function ConversationLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 border-b border-field-800 px-5 py-3.5">
        <div className="h-4 w-4 animate-pulse rounded bg-field-800" />
        <div className="h-4 w-32 animate-pulse rounded bg-field-800" />
      </div>

      {/* Message skeletons */}
      <div className="flex-1 overflow-hidden px-5 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <SkeletonBubble align="left"  wide />
          <SkeletonBubble align="right" />
          <SkeletonBubble align="left"  wide />
        </div>
      </div>

      {/* Input skeleton */}
      <div className="border-t border-field-800 px-5 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="h-11 animate-pulse rounded-xl bg-field-800" />
        </div>
      </div>
    </div>
  );
}
