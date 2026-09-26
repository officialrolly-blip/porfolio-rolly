import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteShell from "./components/SiteShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rolly Paredes | Portfolio",
  description: "Portfolio of Rolly Paredes - projects, about, and contact.",
  icons: {
    // Animated tab icon (animates in Firefox/Chrome, first frame elsewhere)
    icon: [
      { url: "/logo-animated.gif", type: "image/gif" },
      { url: "/logo-static.png", type: "image/png" },
    ],
    shortcut: "/logo-animated.gif",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

