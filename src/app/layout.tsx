import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0E0E10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "FluentVoice AI — Conversational English Coach (Basic to Pro)",
  description: "Master spoken English with interactive AI voice conversations, instant grammar repair, vocabulary upgrades, and roleplay scenarios.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth antialiased" suppressHydrationWarning>
      <body className="h-[100dvh] w-screen overflow-hidden bg-ink text-paper" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
