"use client";

import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  PlusCircle,
  Settings,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { useSeller } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/store/sessionStore";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/biznesa-panelis", key: "overview", icon: LayoutDashboard, exact: true },
  { href: "/biznesa-panelis/piedavajumi", key: "myListings", icon: Package },
  { href: "/biznesa-panelis/piedavajumi/jauns", key: "addListing", icon: PlusCircle },
  { href: "/biznesa-panelis/pasutijumi", key: "orders", icon: ShoppingBag },
  { href: "/biznesa-panelis/statistika", key: "statistics", icon: TrendingUp },
  { href: "/biznesa-panelis/lokacijas", key: "locations", icon: MapPin },
  { href: "/biznesa-panelis/abonements", key: "subscription", icon: Sparkles },
  { href: "/biznesa-panelis/rekini", key: "invoices", icon: FileText },
  { href: "/biznesa-panelis/uznemuma-dati", key: "companyData", icon: Building2 },
  { href: "/biznesa-panelis/iestatijumi", key: "settings", icon: Settings },
];

export function DashboardShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const seller = useSeller();
  const setUser = useSessionStore((s) => s.setUser);

  if (!hydrated) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title={t("profile.guestTitle")}
          text={t("auth.accountTypeBusinessText")}
          actionLabel={t("nav.login")}
          actionHref="/ienakt"
        />
        <div className="mx-auto mt-4 flex max-w-sm gap-2">
          <Button href="/registreties/uznemums" variant="outline" fullWidth>
            {t("auth.accountTypeBusiness")}
          </Button>
          <Button href="/registreties/majsaimnieciba" variant="outline" fullWidth>
            {t("auth.accountTypeHousehold")}
          </Button>
        </div>
      </div>
    );
  }

  const verification = seller.verificationStatus;

  return (
    <div className="flex min-h-screen bg-sand-50">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sand-200 bg-white md:flex">
        <div className="border-b border-sand-100 px-5 py-4">
          <Logo />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-ink-700 hover:bg-sand-100 hover:text-ink-900",
                )}
              >
                <Icon size={17} />
                {t(`dashboard.${item.key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sand-100 p-3">
          <div className="mb-2 rounded-xl bg-sand-50 px-3 py-2.5">
            <p className="truncate text-xs font-bold text-ink-900">{seller.displayName}</p>
            <p className="truncate text-[11px] text-ink-600">{seller.user.email}</p>
          </div>
          <button
            onClick={() => {
              setUser(null);
              router.push("/");
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} /> {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* Content */}
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
                className="hidden rounded-xl border border-sand-200 px-3 py-2 text-xs font-bold text-ink-700 transition hover:border-brand-300 sm:block"
              >
                {t("nav.home")}
              </Link>
              {action}
            </div>
          </div>
        </header>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {verification !== "approved" && (
            <div
              className={cn(
                "mb-5 flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold",
                verification === "pending"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              <Badge tone={verification === "pending" ? "amber" : "red"}>
                {t(`admin.verificationStatus.${verification}`)}
              </Badge>
              {verification === "pending"
                ? t("dashboard.verificationPending")
                : verification === "suspended"
                  ? t("dashboard.verificationSuspended")
                  : t("dashboard.verificationRejected")}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
