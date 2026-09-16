"use client";

import { Cloud, Leaf, PiggyBank, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { ChartCard, MonthlyImpactChart } from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { CO2_KG_PER_FOOD_KG } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";
import { formatNumber, formatPrice } from "@/lib/utils";

export default function ImpactPage() {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const impact = useDataStore((s) => s.impact);
  const orders = useDataStore((s) => s.orders);
  const user = useSessionStore((s) => s.user);

  const current = impact[impact.length - 1];
  const chartData = useMemo(
    () =>
      impact.map((row) => ({
        label: new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-GB", {
          month: "short",
        }).format(new Date(row.periodStart)),
        kg: row.savedFoodKg,
      })),
    [impact, locale],
  );

  const personal = useMemo(() => {
    const mine = orders.filter(
      (o) => user && o.customerUserId === user.id && o.status !== "cancelled",
    );
    return {
      kg: mine.reduce((sum, o) => sum + o.savedFoodKg, 0),
      money: mine.reduce((sum, o) => sum + o.savedAmount, 0),
      items: mine.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0),
    };
  }, [orders, user]);

  const weeklyItems = current ? Math.round(current.savedItems / 4) : 0;

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
          <Leaf size={14} /> {t("common.demoBadge")}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-ink-900 sm:text-4xl">{t("impact.title")}</h1>
        <p className="mt-3 text-base text-ink-600">{t("impact.subtitle")}</p>
      </div>

      {!hydrated ? (
        <Skeleton className="mt-8 h-64 w-full rounded-3xl" />
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <BigStat
              icon={<Leaf size={22} />}
              value={current ? `${formatNumber(current.savedFoodKg, locale)} kg` : "—"}
              label={t("impact.monthTotal", {
                kg: current ? formatNumber(current.savedFoodKg, locale) : "—",
              })}
              tone="bg-brand-600"
            />
            <BigStat
              icon={<Sparkles size={22} />}
              value={formatNumber(weeklyItems, locale)}
              label={t("impact.weekItems", { count: formatNumber(weeklyItems, locale) })}
              tone="bg-clay-500"
            />
            <BigStat
              icon={<Cloud size={22} />}
              value={current ? `${formatNumber(current.co2AvoidedKg, locale)} kg` : "—"}
              label={t("impact.co2")}
              tone="bg-ink-800"
            />
          </section>

          <p className="mt-3 text-center text-xs text-ink-600">{t("impact.demoDisclaimer")}</p>

          <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <ChartCard title={t("impact.monthlyChart")} subtitle={t("impact.platformTitle")}>
              <MonthlyImpactChart data={chartData} />
            </ChartCard>

            <div className="card p-6">
              <h2 className="text-base font-extrabold text-ink-900">{t("impact.yourImpact")}</h2>
              {user ? (
                <>
                  <p className="mt-2 text-sm text-ink-600">
                    {t("impact.yourImpactText", { kg: formatNumber(personal.kg, locale, 1) })}
                  </p>
                  <div className="mt-4 space-y-3">
                    <PersonalRow
                      icon={<Leaf size={16} />}
                      label={t("offer.savedFood")}
                      value={`${formatNumber(personal.kg, locale, 1)} kg`}
                    />
                    <PersonalRow
                      icon={<PiggyBank size={16} />}
                      label={t("impact.yourSavings")}
                      value={formatPrice(personal.money, locale)}
                    />
                    <PersonalRow
                      icon={<Sparkles size={16} />}
                      label={t("impact.yourOrders")}
                      value={formatNumber(personal.items, locale)}
                    />
                    <PersonalRow
                      icon={<Cloud size={16} />}
                      label={t("impact.co2")}
                      value={`${formatNumber(personal.kg * CO2_KG_PER_FOOD_KG, locale, 1)} kg`}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-ink-600">{t("profile.guestText")}</p>
                  <div className="mt-4 flex gap-2">
                    <Button href="/ienakt" variant="outline" size="sm">
                      {t("nav.login")}
                    </Button>
                    <Button href="/piedavajumi" size="sm">
                      {t("impact.startSaving")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}

      <section className="card mt-8 p-6">
        <h2 className="text-base font-extrabold text-ink-900">{t("impact.methodology")}</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink-600">{t("impact.methodologyText")}</p>
      </section>

      <section className="mt-10 text-center">
        <Button href="/piedavajumi" size="lg">
          {t("impact.startSaving")}
        </Button>
      </section>
    </div>
  );
}

function BigStat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className={`rounded-3xl ${tone} p-6 text-white`}>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
        {icon}
      </span>
      <p className="mt-4 text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-white/80">{label}</p>
    </div>
  );
}

function PersonalRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-sand-50 px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink-700">
        <span className="text-brand-600">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-extrabold text-ink-900">{value}</span>
    </div>
  );
}
