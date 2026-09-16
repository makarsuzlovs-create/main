"use client";

import {
  Bell,
  Heart,
  LayoutDashboard,
  Leaf,
  LogOut,
  Package,
  PiggyBank,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { CO2_KG_PER_FOOD_KG } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";
import { formatNumber, formatPrice } from "@/lib/utils";

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const orders = useDataStore((s) => s.orders);
  const notifications = useDataStore((s) => s.notifications);
  const markRead = useDataStore((s) => s.markNotificationRead);

  const stats = useMemo(() => {
    const mine = orders.filter(
      (o) => user && o.customerUserId === user.id && o.status !== "cancelled",
    );
    return {
      orders: mine.length,
      kg: mine.reduce((sum, o) => sum + o.savedFoodKg, 0),
      money: mine.reduce((sum, o) => sum + o.savedAmount, 0),
      items: mine.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
        0,
      ),
    };
  }, [orders, user]);

  const myNotifications = notifications.filter((n) => user && n.userId === user.id);

  if (!hydrated) {
    return (
      <div className="container-page py-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<UserIcon size={28} />}
          title={t("profile.guestTitle")}
          text={t("profile.guestText")}
          actionLabel={t("nav.login")}
          actionHref="/ienakt"
        />
        <div className="mx-auto mt-4 flex max-w-xs justify-center">
          <Button href="/registreties" variant="outline" fullWidth>
            {t("nav.register")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-lg font-extrabold text-white">
                {user.fullName
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold text-ink-900">{user.fullName}</h1>
                <p className="truncate text-sm text-ink-600">{user.email}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-brand-700">
                  {t(`admin.roles.${user.role}`)}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <ProfileLink href="/pasutijumi" icon={<Package size={16} />}>
                {t("profile.myOrders")}
              </ProfileLink>
              <ProfileLink href="/favoriti" icon={<Heart size={16} />}>
                {t("profile.myFavorites")}
              </ProfileLink>
              <ProfileLink href="/ietekme" icon={<Leaf size={16} />}>
                {t("profile.myImpact")}
              </ProfileLink>
              {(user.role === "business" || user.role === "household") && (
                <ProfileLink href="/biznesa-panelis" icon={<LayoutDashboard size={16} />}>
                  {t("profile.sellerPanel")}
                </ProfileLink>
              )}
              {user.role === "admin" && (
                <ProfileLink href="/admin" icon={<ShieldCheck size={16} />}>
                  {t("profile.adminPanel")}
                </ProfileLink>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-sand-100 pt-4">
              <span className="text-sm font-semibold text-ink-700">{t("profile.language")}</span>
              <LanguageSwitch />
            </div>

            <button
              onClick={() => {
                setUser(null);
                router.push("/");
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} /> {t("profile.logout")}
            </button>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="text-base font-extrabold text-ink-900">{t("impact.yourImpact")}</h2>
            <p className="mt-1 text-sm text-ink-600">
              {t("impact.yourImpactText", { kg: formatNumber(stats.kg, locale, 1) })}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <StatTile
                icon={<Leaf size={18} />}
                value={`${formatNumber(stats.kg, locale, 1)} kg`}
                label={t("offer.savedFood")}
              />
              <StatTile
                icon={<PiggyBank size={18} />}
                value={formatPrice(stats.money, locale)}
                label={t("impact.yourSavings")}
              />
              <StatTile
                icon={<Package size={18} />}
                value={formatNumber(stats.items, locale)}
                label={t("impact.yourOrders")}
              />
            </div>
            <p className="mt-3 text-xs text-ink-600">
              {t("impact.co2")}:{" "}
              {t("impact.co2Text", {
                kg: formatNumber(stats.kg * CO2_KG_PER_FOOD_KG, locale, 1),
              })}
            </p>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
              <Bell size={17} /> {t("profile.notifications")}
            </h2>
            {myNotifications.length ? (
              <ul className="mt-3 space-y-2">
                {myNotifications.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-2xl border p-3 ${
                      n.read ? "border-sand-200 bg-white" : "border-brand-200 bg-brand-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-ink-900">
                          {locale === "lv" ? n.titleLv : n.titleEn}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-600">
                          {locale === "lv" ? n.bodyLv : n.bodyEn}
                        </p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="shrink-0 text-xs font-bold text-brand-700"
                        >
                          {t("common.close")}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-600">{t("common.noResults")}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ProfileLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-sand-100"
    >
      <span className="text-brand-600">{icon}</span>
      {children}
    </Link>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-sand-50 p-4">
      <span className="text-brand-600">{icon}</span>
      <p className="mt-1.5 text-lg font-extrabold text-ink-900">{value}</p>
      <p className="text-xs font-semibold text-ink-600">{label}</p>
    </div>
  );
}
