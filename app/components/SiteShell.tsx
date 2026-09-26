"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import ChatAssistant from "./ChatAssistant";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdmin) {
    // Admin has its own sidebar — never show the public header / chat widget there.
    return <>{children}</>;
  }
  return (
    <>
      <Header />
      {children}
      <ChatAssistant />
    </>
  );
}
