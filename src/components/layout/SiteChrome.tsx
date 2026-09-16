"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/** Dashboard areas bring their own shell, so the marketplace chrome is skipped. */
const PANEL_PREFIXES = ["/biznesa-panelis", "/admin"];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPanel = PANEL_PREFIXES.some((p) => pathname.startsWith(p));

  if (isPanel) {
    return (
      <>
        <div className="min-h-screen pb-20 md:pb-0">{children}</div>
        <BottomNav />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
