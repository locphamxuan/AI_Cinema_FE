import type { Metadata } from "next";
import Script from "next/script";
import { Be_Vietnam_Pro, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { cn } from "@/lib/utils";

// Be Vietnam Pro is drawn for Vietnamese, so stacked diacritics stay crisp at small sizes.
const body = Be_Vietnam_Pro({
  variable: "--font-face-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Titles and big figures.
const display = Bricolage_Grotesque({
  variable: "--font-face-display",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Cinema - Nền Tảng Streaming Phim AI",
  description:
    "AI Cinema - Nền tảng OTT Streaming phim AI với hệ thống ví tiền tệ kép, tuân thủ quy chuẩn nội dung số Việt Nam.",
  keywords: ["AI Cinema", "streaming", "phim AI", "OTT", "Việt Nam"],
};

const themeInitScript = `
  (function() {
    try {
      var saved = localStorage.getItem('ai_cinema_theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("h-full antialiased", body.variable, display.variable)} suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
