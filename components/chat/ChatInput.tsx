"use client";

import { useState, useRef } from "react";
import { Paperclip, ArrowUp, Square, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/toast-context";

const PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const PDF  = "application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

const ACCEPTED_MIME = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  PDF,
  PPTX,
].join(",");

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string;    // base64, no prefix
  dataUrl: string; // for <img> preview
  size: number;
}

interface Props {
  streaming: boolean;
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function ChatInput({ streaming, onSend, onStop }: Props) {
  const { toast } = useToast();

  const [input,       setInput]       = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading,   setUploading]   = useState(false);
  const [error,       setError]       = useState("");
  const [dragging,    setDragging]    = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  // ── Client-side validation — runs BEFORE any network call ─────────────────
  function validate(file: File): string | null {
    const ok = ACCEPTED_MIME.includes(file.type);
    if (!ok) return `"${file.name}" is not supported. Use images, PDF, or PPTX.`;
    if (file.size > MAX_BYTES)
      return `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.`;
    return null;
  }

  async function processFile(file: File) {
    // 1. Validate immediately — no network trip for bad files
    const validErr = validate(file);
    if (validErr) { setError(validErr); return; }
    setError("");

    if (file.type === PPTX || file.type === PDF) {
      // 2a. Server upload — extract text from PPTX, confirm PDF readability
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res  = await fetch("/api/upload", { method: "POST", body: form });
        const json = await res.json() as {
          name: string; type: string;
          extractedText: string | null; message: string | null; error?: string;
        };

        if (!res.ok) {
          const msg = json.error ?? "Upload failed.";
          setError(msg);
          toast(msg, "error");
          return;
        }

        // Server returned a helpful error (e.g. scanned/image-only file)
        if (json.message) {
          setError(json.message);
          toast(json.message, "error");
          return;
        }

        if (file.type === PPTX && json.extractedText) {
          // PPTX: Claude can't read the binary — inject extracted text into the textarea
          setInput((prev) =>
            prev.trim()
              ? prev
              : `Here is my pitch deck:\n\n${json.extractedText}\n\n---\nPlease review this deck and give me investor-grade feedback.`
          );
          resize();
          toast(`"${file.name}" uploaded — text extracted.`, "success");
          return; // no binary attachment — text is enough
        }

        // PDF: attach as base64 (Claude reads natively) + auto-fill prompt
        const dataUrl = await readAsDataUrl(file);
        setAttachments((p) => [
          ...p,
          { id: crypto.randomUUID(), name: file.name, type: file.type,
            data: dataUrl.split(",")[1], dataUrl, size: file.size },
        ]);
        setInput((prev) => prev.trim()
          ? prev
          : "Please review this deck and give me investor-grade feedback."
        );
        resize();
        toast(`"${file.name}" attached.`, "success");

      } catch {
        const msg = "Upload failed. Please try again.";
        setError(msg);
        toast(msg, "error");
      } finally {
        setUploading(false);
      }

    } else {
      // 2b. Image — read locally, no upload needed
      const dataUrl = await readAsDataUrl(file);
      setAttachments((p) => [
        ...p,
        { id: crypto.randomUUID(), name: file.name, type: file.type,
          data: dataUrl.split(",")[1], dataUrl, size: file.size },
      ]);
      setInput((prev) => prev.trim()
        ? prev
        : "Please review this deck and give me investor-grade feedback."
      );
      resize();
      toast(`"${file.name}" attached.`, "success");
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    for (const file of Array.from(e.target.files ?? [])) await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function send() {
    const text = input.trim();
    if ((!text && !attachments.length) || streaming || uploading) return;
    onSend(text, attachments);
    setInput("");
    setAttachments([]);
    setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  return (
    <div
      className={cn(
        "border-t border-field-800 px-5 py-4 transition-colors",
        dragging && "bg-field-900/40"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="mx-auto max-w-2xl space-y-2">
        {/* Pending attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-1">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-1.5 rounded-lg border border-field-700 bg-field-900 pl-1.5 pr-1 py-1 text-xs text-field-400"
              >
                {a.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.dataUrl} alt={a.name} className="h-5 w-5 rounded object-cover" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-field-500" />
                )}
                <span className="max-w-[120px] truncate">{a.name}</span>
                <button
                  onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}
                  className="ml-0.5 rounded p-0.5 hover:bg-field-800 transition-colors"
                >
                  <X className="h-3 w-3 text-field-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error — shown immediately after validation, before any upload */}
        {error && (
          <p className="rounded-lg border border-red-900/30 bg-red-950/20 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        {/* Input box */}
        <div
          className={cn(
            "flex items-end gap-2 rounded-xl border bg-field-900 px-3 py-3 transition-colors",
            dragging
              ? "border-sage-600/40 bg-sage-900/10"
              : "border-field-700 focus-within:border-field-600"
          )}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Attach image, PDF, or PPTX"
            className="shrink-0 rounded-lg p-1 text-field-600 transition-colors hover:bg-field-800 hover:text-field-300 disabled:opacity-40"
          >
            {uploading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Paperclip className="h-4 w-4" />
            }
          </button>

          <textarea
            ref={textareaRef}
            id="message-input"
            name="message"
            value={input}
            onChange={(e) => { setInput(e.target.value); resize(); }}
            onKeyDown={handleKeyDown}
            placeholder={
              streaming  ? "Thinking…" :
              dragging   ? "Drop file here…" :
                           "Message Folio…"
            }
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent text-sm text-field-200 placeholder:text-field-600 focus:outline-none transition-opacity",
              streaming && "opacity-40 cursor-default",
            )}
          />

          <button
            onClick={streaming ? onStop : send}
            disabled={!streaming && !input.trim() && !attachments.length}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sage-400 text-field-950 transition-colors hover:bg-sage-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {streaming
              ? <Square className="h-3 w-3 fill-current" />
              : <ArrowUp className="h-3.5 w-3.5" />
            }
          </button>
        </div>

        <p className="text-center text-xs text-field-700">
          Drop or click to attach · Images, PDF, PPTX · Max 10 MB · Shift+Enter for new line
        </p>
      </div>

      <input
        ref={fileInputRef}
        id="file-upload"
        name="file-upload"
        type="file"
        accept={ACCEPTED_MIME}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
