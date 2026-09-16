"use client";

import {
  Home,
  LayoutDashboard,
  Map,
  Package,
  Plus,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/components/providers/AppProviders";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/store/sessionStore";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
};

export function BottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const user = useSessionStore((s) => s.user);
  const isSeller = hydrated && (user?.role === "business" || user?.role === "household");

  const customerItems: Item[] = [
    { href: "/", label: t("nav.home"), icon: <Home size={20} /> },
    { href: "/piedavajumi", label: t("common.search"), icon: <Search size={20} /> },
    { href: "/karte", label: t("nav.map"), icon: <Map size={20} /> },
    { href: "/pasutijumi", label: t("nav.orders"), icon: <ShoppingBag size={20} /> },
    { href: "/profils", label: t("nav.profile"), icon: <User size={20} /> },
  ];

  const sellerItems: Item[] = [
    { href: "/biznesa-panelis", label: t("nav.dashboard"), icon: <LayoutDashboard size={20} /> },
    { href: "/biznesa-panelis/piedavajumi", label: t("nav.listings"), icon: <Package size={20} /> },
    {
      href: "/biznesa-panelis/piedavajumi/jauns",
      label: t("nav.addListing"),
      icon: <Plus size={22} />,
      highlight: true,
    },
    { href: "/biznesa-panelis/pasutijumi", label: t("nav.orders"), icon: <ShoppingBag size={20} /> },
    { href: "/profils", label: t("nav.profile"), icon: <User size={20} /> },
  ];

  const items = isSeller ? sellerItems : customerItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const active =
            item.href === "/" || item.href === "/biznesa-panelis"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          if (item.highlight) {
            return (
              <li key={item.href} className="flex flex-1 items-center justify-center">
                <Link
                  href={item.href}
                  className="-mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lift"
                  aria-label={item.label}
                >
                  {item.icon}
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-bold transition",
                  active ? "text-brand-700" : "text-ink-600",
                )}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
