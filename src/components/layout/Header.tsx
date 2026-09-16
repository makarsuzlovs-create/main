"use client";

import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { LocationSelector } from "@/components/layout/LocationSelector";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/components/providers/AppProviders";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/store/sessionStore";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");

  // Keep the header field in sync with the browse page's query parameter
  // without making every page dynamically rendered.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q") ?? "";
    setQuery(q);
  }, [pathname]);
  const user = useSessionStore((s) => s.user);
  const cart = useSessionStore((s) => s.cart);
  const cartCount = hydrated ? cart.reduce((sum, i) => sum + i.quantity, 0) : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/piedavajumi?q=${encodeURIComponent(query.trim())}` : "/piedavajumi");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/95 backdrop-blur">
      <div className="container-page">
        <div className="flex h-16 items-center gap-3 md:h-[72px] md:gap-5">
          <Logo />

          <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
            <LocationSelector className="w-56 shrink-0" />
            <form onSubmit={submit} className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600/60"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="field h-11 pl-10"
                aria-label={t("home.searchPlaceholder")}
              />
            </form>
          </div>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            <HeaderLink href="/piedavajumi">{t("nav.browse")}</HeaderLink>
            <HeaderLink href="/ietekme">{t("nav.impact")}</HeaderLink>
            <HeaderLink href="/par-mums">{t("nav.about")}</HeaderLink>
            <HeaderLink href="/cenas">{t("nav.pricing")}</HeaderLink>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <LanguageSwitch className="hidden sm:inline-flex" />
            <Link
              href="/grozs"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sand-200 bg-white text-ink-800 transition hover:border-brand-300"
              aria-label={t("nav.cart")}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-clay-500 px-1 text-[11px] font-extrabold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {hydrated && user ? (
              <UserMenu />
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button href="/ienakt" variant="outline" size="sm">
                  {t("nav.login")}
                </Button>
                <Button href="/registreties" size="sm">
                  {t("nav.register")}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search row */}
        <div className="flex items-center gap-2 pb-3 md:hidden">
          <LocationSelector compact className="max-w-[45%] shrink-0" />
          <form onSubmit={submit} className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/60"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("home.searchPlaceholder")}
              className="field h-10 pl-9 text-sm"
              aria-label={t("home.searchPlaceholder")}
            />
          </form>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-sand-100 hover:text-ink-900"
    >
      {children}
    </Link>
  );
}

function UserMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;
  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-xl border border-sand-200 bg-white py-1.5 pl-1.5 pr-2 transition hover:border-brand-300"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-extrabold text-white">
          {initials}
        </span>
        <ChevronDown size={15} className="text-ink-600" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-sand-200 bg-white py-1.5 shadow-lift animate-fade-in">
          <div className="border-b border-sand-100 px-4 py-2.5">
            <p className="truncate text-sm font-bold text-ink-900">{user.fullName}</p>
            <p className="truncate text-xs text-ink-600">{user.email}</p>
          </div>
          <MenuItem href="/profils" icon={<UserIcon size={16} />} onClick={() => setOpen(false)}>
            {t("nav.profile")}
          </MenuItem>
          <MenuItem href="/pasutijumi" icon={<Package size={16} />} onClick={() => setOpen(false)}>
            {t("nav.orders")}
          </MenuItem>
          <MenuItem href="/favoriti" icon={<Heart size={16} />} onClick={() => setOpen(false)}>
            {t("nav.favorites")}
          </MenuItem>
          {(user.role === "business" || user.role === "household") && (
            <MenuItem
              href="/biznesa-panelis"
              icon={<LayoutDashboard size={16} />}
              onClick={() => setOpen(false)}
            >
              {t("profile.sellerPanel")}
            </MenuItem>
          )}
          {user.role === "admin" && (
            <MenuItem href="/admin" icon={<ShieldCheck size={16} />} onClick={() => setOpen(false)}>
              {t("profile.adminPanel")}
            </MenuItem>
          )}
          <button
            onClick={() => {
              setUser(null);
              setOpen(false);
              router.push("/");
            }}
            className="flex w-full items-center gap-2.5 border-t border-sand-100 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} />
            {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-sand-100",
      )}
    >
      <span className="text-ink-600">{icon}</span>
      {children}
    </Link>
  );
}
