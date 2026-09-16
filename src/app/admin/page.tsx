"use client";

import { Building2, Leaf, Package, ShoppingBag, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ChartCard, OrdersBarChart, RevenueAreaChart } from "@/components/dashboard/Charts";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { buildDailySeries, ordersWithinDays, totals } from "@/lib/stats";
import { useDataStore } from "@/lib/store/dataStore";
import { effectiveStatus, formatDate, formatNumber, formatPrice } from "@/lib/utils";

export default function AdminOverviewPage() {
  const { t, locale } = useI18n();
  const users = useDataStore((s) => s.users);
  const businesses = useDataStore((s) => s.businesses);
  const households = useDataStore((s) => s.households);
  const listings = useDataStore((s) => s.listings);
  const orders = useDataStore((s) => s.orders);
  const reports = useDataStore((s) => s.reports);
  const setVerification = useDataStore((s) => s.setVerification);

  const series = useMemo(() => buildDailySeries(orders, 30), [orders]);
  const last30 = useMemo(() => totals(ordersWithinDays(orders, 30)), [orders]);
  const activeListings = useMemo(() => {
    const now = new Date();
    return listings.filter((l) => effectiveStatus(l, now) === "active");
  }, [listings]);

  const pending = [
    ...businesses
      .filter((b) => b.verificationStatus === "pending")
      .map((b) => ({
        id: b.id,
        type: "business" as const,
        name: b.companyName,
        detail: `${b.registrationNumber} · ${b.legalAddress}`,
        createdAt: b.createdAt,
      })),
    ...households
      .filter((h) => h.verificationStatus === "pending")
      .map((h) => ({
        id: h.id,
        type: "household" as const,
        name: h.displayName,
        detail: `${h.fullName} · ${h.city}`,
        createdAt: h.createdAt,
      })),
  ];

  return (
    <AdminShell title={t("admin.overview")}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <KpiCard icon={<Users size={17} />} label={t("admin.kpiUsers")} value={String(users.length)} />
          <KpiCard
            icon={<Building2 size={17} />}
            label={t("admin.kpiSellers")}
            value={String(businesses.length + households.length)}
            tone="violet"
          />
          <KpiCard
            icon={<Package size={17} />}
            label={t("admin.kpiActiveListings")}
            value={String(activeListings.length)}
            tone="sky"
          />
          <KpiCard
            icon={<ShoppingBag size={17} />}
            label={t("admin.kpiOrders30")}
            value={formatNumber(last30.orders, locale)}
          />
          <KpiCard
            icon={<Wallet size={17} />}
            label={t("admin.kpiGmv")}
            value={formatPrice(last30.revenue, locale)}
            tone="clay"
          />
          <KpiCard
            icon={<Leaf size={17} />}
            label={t("admin.kpiSavedKg")}
            value={`${formatNumber(last30.foodKg, locale, 0)} kg`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title={t("dashboard.chartOrders")} subtitle={t("dashboard.last30days")}>
            <OrdersBarChart data={series} />
          </ChartCard>
          <ChartCard title={t("dashboard.chartRevenue")} subtitle={t("dashboard.last30days")}>
            <RevenueAreaChart data={series} />
          </ChartCard>
        </div>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4">
            <h2 className="text-sm font-extrabold text-ink-900">{t("admin.pendingVerification")}</h2>
            <Link href="/admin/uznemumi" className="text-xs font-bold text-brand-700 hover:underline">
              {t("home.seeAll")}
            </Link>
          </div>
          {pending.length ? (
            <ul className="divide-y divide-sand-100">
              {pending.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-ink-900">{item.name}</p>
                    <p className="truncate text-xs text-ink-600">{item.detail}</p>
                  </div>
                  <span className="text-xs text-ink-600">{formatDate(item.createdAt, locale)}</span>
                  <Badge tone="amber">{t("admin.verificationStatus.pending")}</Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setVerification(item.type, item.id, "approved")}
                    >
                      {t("admin.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setVerification(item.type, item.id, "rejected")}
                    >
                      {t("admin.reject")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-ink-600">{t("common.noResults")}</p>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4">
            <h2 className="text-sm font-extrabold text-ink-900">{t("admin.reports")}</h2>
            <Link href="/admin/zinojumi" className="text-xs font-bold text-brand-700 hover:underline">
              {t("home.seeAll")}
            </Link>
          </div>
          <ul className="divide-y divide-sand-100">
            {reports.slice(0, 4).map((report) => (
              <li key={report.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{report.targetLabel}</p>
                  <p className="truncate text-xs text-ink-600">{report.reason}</p>
                </div>
                <Badge tone={report.status === "open" ? "red" : "neutral"}>
                  {t(`admin.reportStatus.${report.status}`)}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
