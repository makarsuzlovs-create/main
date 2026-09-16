"use client";

import {
  Building2,
  FileText,
  Flag,
  LayoutDashboard,
  ListTree,
  LogOut,
  Package,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { Logo } from "@/components/layout/Logo";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/store/sessionStore";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", key: "overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/lietotaji", key: "users", icon: Users },
  { href: "/admin/uznemumi", key: "businesses", icon: Building2 },
  { href: "/admin/sludinajumi", key: "listings", icon: Package },
  { href: "/admin/pasutijumi", key: "orders", icon: ShoppingBag },
  { href: "/admin/abonementi", key: "subscriptions", icon: Sparkles },
  { href: "/admin/rekini", key: "invoices", icon: FileText },
  { href: "/admin/kategorijas", key: "categories", icon: ListTree },
  { href: "/admin/zinojumi", key: "reports", icon: Flag },
];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);

  if (!hydrated) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="container-page py-16">
        <EmptyState
          title={t("admin.accessDenied")}
          text={t("auth.demoAccountsText")}
          actionLabel={t("nav.login")}
          actionHref="/ienakt"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ink-900/[0.03]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sand-200 bg-ink-900 text-white md:flex">
        <div className="border-b border-white/10 px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm font-extrabold">
              D
            </span>
            <span className="text-sm font-extrabold">{t("admin.title")}</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon size={17} />
                {t(`admin.${item.key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => {
              setUser(null);
              router.push("/");
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            <LogOut size={16} /> {t("nav.logout")}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-sand-200 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
            <div className="md:hidden">
              <Logo compact />
            </div>
            <h1 className="min-w-0 truncate text-lg font-extrabold text-ink-900">{title}</h1>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitch />
              <Link
                href="/"
                className="rounded-xl border border-sand-200 px-3 py-2 text-xs font-bold text-ink-700 transition hover:border-brand-300"
              >
                {t("nav.home")}
              </Link>
            </div>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-sand-100 px-4 py-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "chip whitespace-nowrap",
                  (item.exact ? pathname === item.href : pathname.startsWith(item.href)) &&
                    "chip-active",
                )}
              >
                {t(`admin.${item.key}`)}
              </Link>
            ))}
          </nav>
        </header>
        <div className="px-4 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
