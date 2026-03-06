"use client";

import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/context/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
