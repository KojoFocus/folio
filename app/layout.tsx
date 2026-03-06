// app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title:       "Folio — Investor-grade decks, effortlessly",
  description: "AI-powered pitch deck analysis and generation for SMEs. Review your deck, build a new one, or model your financials.",
  keywords:    ["pitch deck", "startup", "investor", "SME", "Africa", "business plan"],
  openGraph: {
    title:       "Folio",
    description: "Investor-grade decks, effortlessly.",
    type:        "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${playfair.variable} ${instrument.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
