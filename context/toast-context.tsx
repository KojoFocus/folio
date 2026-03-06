"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id:       string;
  message:  string;
  type:     ToastType;
  duration: number;
}

interface ToastContextValue {
  /** Append a toast. Returns its id so you can dismiss it programmatically. */
  toast: (message: string, type?: ToastType, duration?: number) => string;
  /** Remove a specific toast immediately. */
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}

// ── Individual toast ────────────────────────────────────────────────────────

const ICON = {
  success: <CheckCircle  className="h-4 w-4 shrink-0 text-sage-400" />,
  error:   <AlertCircle  className="h-4 w-4 shrink-0 text-red-400" />,
  info:    <Info         className="h-4 w-4 shrink-0 text-field-400" />,
} as const;

const BAR_COLOR = {
  success: "bg-sage-400",
  error:   "bg-red-400",
  info:    "bg-field-500",
} as const;

function ToastBubble({
  item,
  onDismiss,
}: {
  item:      ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  // Trigger enter animation on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-80 items-start gap-3 overflow-hidden rounded-xl border border-field-700 bg-field-900 px-4 py-3 shadow-xl transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
    >
      {ICON[item.type]}

      <p className="flex-1 text-sm text-field-200">{item.message}</p>

      <button
        onClick={() => onDismiss(item.id)}
        className="shrink-0 rounded p-0.5 text-field-600 transition-colors hover:text-field-300"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Progress bar — shrinks from 100 → 0 over `duration` ms */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 origin-left",
          BAR_COLOR[item.type],
        )}
        style={{
          width:     "100%",
          animation: `toast-shrink ${item.duration}ms linear forwards`,
        }}
      />
    </div>
  );
}

// ── Container (portal-like, fixed bottom-right) ────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts:    ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastBubble key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Provider ───────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000): string => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => { timers.current.forEach(clearTimeout); };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
