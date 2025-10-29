import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const mainFont = Roboto({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-main",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Pathfinder",
  description: "Pathfinder - Your AI-powered career coach"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn("dark min-h-screen font-main relative bg-background text-foreground antialiased", mainFont.variable)}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
