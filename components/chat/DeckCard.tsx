"use client";

import { Download, Presentation } from "lucide-react";

interface Props {
  url:        string;
  filename:   string;
  slideCount: number;
}

export function DeckCard({ url, filename, slideCount }: Props) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-sage-600/30 bg-sage-600/10 px-4 py-3">
      <Presentation className="h-5 w-5 shrink-0 text-sage-400" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-field-200">{filename}</p>
        <p className="text-xs text-field-500">{slideCount} slides · PowerPoint</p>
      </div>

      <a
        href={`/api/deck-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`}
        download={filename}
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-sage-400 px-3 py-1.5 text-xs font-medium text-field-950 transition-colors hover:bg-sage-300"
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </a>
    </div>
  );
}
