import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { SiteChrome } from "@/components/layout/SiteChrome";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Derīgs — Glāb pārtiku. Ietaupi naudu.",
  description:
    "Derīgs ir Latvijas tirgus laukums nepārdotai pārtikai: veikali, kafejnīcas un mājsaimniecības piedāvā pārpalikumus par zemāku cenu.",
};

export const viewport: Viewport = {
  themeColor: "#1c5542",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv" className={jakarta.variable}>
      <body>
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
