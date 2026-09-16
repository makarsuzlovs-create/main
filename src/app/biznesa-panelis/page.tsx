"use client";

import { Leaf, Package, PlusCircle, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  ChartCard,
  FoodLineChart,
  OrdersBarChart,
  RevenueAreaChart,
} from "@/components/dashboard/Charts";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSeller, type SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { buildDailySeries, ordersToday, ordersWithinDays, totals } from "@/lib/stats";
import { formatNumber, formatPrice, formatTime } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell
      title={t("dashboard.overview")}
      action={
        <Button href="/biznesa-panelis/piedavajumi/jauns" size="sm">
          <PlusCircle size={16} /> {t("dashboard.addListing")}
        </Button>
      }
    >
      {seller && <Overview seller={seller} />}
    </DashboardShell>
  );
}

function Overview({ seller }: { seller: SellerContext }) {
  const { t, locale } = useI18n();
  const series = useMemo(() => buildDailySeries(seller.orders, 30), [seller.orders]);
  const last30 = useMemo(() => totals(ordersWithinDays(seller.orders, 30)), [seller.orders]);
  const today = ordersToday(seller.orders);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink-900">
          {t("dashboard.welcome", { name: seller.displayName })}
        </h2>
        <p className="text-sm text-ink-600">{t("dashboard.last30days")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard
          icon={<Package size={17} />}
          label={t("dashboard.kpiActiveListings")}
          value={String(seller.activeListings.length)}
          sublabel={
            seller.limits.maxListings ? `/ ${seller.limits.maxListings}` : undefined
          }
        />
        <KpiCard
          icon={<ShoppingBag size={17} />}
          label={t("dashboard.kpiTodayOrders")}
          value={String(today.length)}
          tone="sky"
        />
        <KpiCard
          icon={<Wallet size={17} />}
          label={t("dashboard.kpiRevenue")}
          value={formatPrice(last30.revenue, locale)}
          sublabel={t("dashboard.last30days")}
          tone="clay"
        />
        <KpiCard
          icon={<TrendingUp size={17} />}
          label={t("dashboard.kpiSavedItems")}
          value={formatNumber(last30.items, locale)}
          tone="violet"
        />
        <KpiCard
          icon={<Leaf size={17} />}
          label={t("dashboard.kpiSavedKg")}
          value={`${formatNumber(last30.foodKg, locale, 1)} kg`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title={t("dashboard.chartOrders")} subtitle={t("dashboard.last30days")}>
          <OrdersBarChart data={series} />
        </ChartCard>
        <ChartCard title={t("dashboard.chartRevenue")} subtitle={t("dashboard.last30days")}>
          <RevenueAreaChart data={series} />
        </ChartCard>
        <ChartCard title={t("dashboard.chartFood")} subtitle={t("dashboard.last30days")}>
          <FoodLineChart data={series} />
        </ChartCard>
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4">
          <h3 className="text-sm font-extrabold text-ink-900">{t("dashboard.recentOrders")}</h3>
          <Link
            href="/biznesa-panelis/pasutijumi"
            className="text-xs font-bold text-brand-700 hover:underline"
          >
            {t("home.seeAll")}
          </Link>
        </div>
        {seller.orders.length ? (
          <div className="table-wrap border-0">
            <table className="table-base">
              <thead>
                <tr>
                  <th>{t("checkout.orderNumber")}</th>
                  <th>{t("dashboard.customer")}</th>
                  <th>{t("offer.pickupWindow")}</th>
                  <th>{t("dashboard.orderCode")}</th>
                  <th>{t("common.total")}</th>
                  <th>{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {seller.orders.slice(0, 6).map((order) => (
                  <tr key={order.id}>
                    <td className="font-bold">{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>
                      {formatTime(order.pickupWindowStart, locale)}–
                      {formatTime(order.pickupWindowEnd, locale)}
                    </td>
                    <td className="font-mono font-bold text-brand-700">{order.pickupCode}</td>
                    <td className="font-bold">{formatPrice(order.total, locale)}</td>
                    <td>
                      <Badge tone={order.status === "completed" ? "green" : "brand"}>
                        {t(`orders.status.${order.status}`)}
                      </Badge>
                    </td>
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
