"use client";

import { Leaf, Package, ShoppingBag, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ChartCard,
  FoodLineChart,
  OrdersBarChart,
  RevenueAreaChart,
} from "@/components/dashboard/Charts";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Tabs } from "@/components/ui/Misc";
import { CO2_KG_PER_FOOD_KG } from "@/lib/config";
import { useSeller, type SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { buildDailySeries, ordersWithinDays, totals } from "@/lib/stats";
import { formatNumber, formatPrice } from "@/lib/utils";

export default function SellerStatisticsPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell title={t("dashboard.statistics")}>
      {seller && <Statistics seller={seller} />}
    </DashboardShell>
  );
}

function Statistics({ seller }: { seller: SellerContext }) {
  const { t, locale } = useI18n();
  const [range, setRange] = useState<7 | 30 | 90>(30);

  const series = useMemo(() => buildDailySeries(seller.orders, range), [seller.orders, range]);
  const summary = useMemo(
    () => totals(ordersWithinDays(seller.orders, range)),
    [seller.orders, range],
  );

  const topListings = useMemo(() => {
    const counts = new Map<string, { title: string; quantity: number; revenue: number }>();
    for (const order of ordersWithinDays(seller.orders, range)) {
      for (const item of order.items) {
        const entry = counts.get(item.listingId) ?? {
          title: item.titleSnapshot,
          quantity: 0,
          revenue: 0,
        };
        entry.quantity += item.quantity;
        entry.revenue += item.unitPrice * item.quantity;
        counts.set(item.listingId, entry);
      }
    }
    return Array.from(counts.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [seller.orders, range]);

  return (
    <div className="space-y-5">
      <Tabs
        value={String(range)}
        onChange={(value) => setRange(Number(value) as 7 | 30 | 90)}
        tabs={[
          { value: "7", label: "7 d." },
          { value: "30", label: "30 d." },
          { value: "90", label: "90 d." },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={<ShoppingBag size={17} />}
          label={t("dashboard.orders")}
          value={formatNumber(summary.orders, locale)}
        />
        <KpiCard
          icon={<Wallet size={17} />}
          label={t("dashboard.kpiRevenue")}
          value={formatPrice(summary.revenue, locale)}
          tone="clay"
        />
        <KpiCard
          icon={<Package size={17} />}
          label={t("dashboard.kpiSavedItems")}
          value={formatNumber(summary.items, locale)}
          tone="violet"
        />
        <KpiCard
          icon={<Leaf size={17} />}
          label={t("dashboard.kpiSavedKg")}
          value={`${formatNumber(summary.foodKg, locale, 1)} kg`}
          sublabel={t("impact.co2Text", {
            kg: formatNumber(summary.foodKg * CO2_KG_PER_FOOD_KG, locale, 0),
          })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title={t("dashboard.chartOrders")}>
          <OrdersBarChart data={series} />
        </ChartCard>
        <ChartCard title={t("dashboard.chartRevenue")}>
          <RevenueAreaChart data={series} />
        </ChartCard>
        <ChartCard title={t("dashboard.chartFood")}>
          <FoodLineChart data={series} />
        </ChartCard>
      </div>

      <section className="card overflow-hidden">
        <h3 className="border-b border-sand-100 px-5 py-4 text-sm font-extrabold text-ink-900">
          {t("dashboard.myListings")}
        </h3>
        {topListings.length ? (
          <div className="table-wrap border-0">
            <table className="table-base">
              <thead>
                <tr>
                  <th>{t("listingForm.name")}</th>
                  <th>{t("listingForm.quantity")}</th>
                  <th>{t("dashboard.kpiRevenue")}</th>
                </tr>
              </thead>
              <tbody>
                {topListings.map((row) => (
                  <tr key={row.title}>
                    <td className="font-semibold">{row.title}</td>
                    <td>{row.quantity}</td>
                    <td className="font-bold">{formatPrice(row.revenue, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-ink-600">{t("dashboard.noOrders")}</p>
        )}
      </section>
    </div>
  );
}
