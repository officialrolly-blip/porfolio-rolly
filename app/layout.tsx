import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ImageKitProvider } from "@imagekit/next";
import "./globals.css";
import SiteShell from "./components/SiteShell";
import { IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit";

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
        <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
          <SiteShell>{children}</SiteShell>
        </ImageKitProvider>
      </body>
    </html>
  );
}

