"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Tabs } from "@/components/ui/Misc";
import { useSeller, type SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { formatDate, formatPrice, formatTime, isToday } from "@/lib/utils";

type Tab = "today" | "upcoming" | "completed" | "all";

export default function SellerOrdersPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell title={t("dashboard.orders")}>
      {seller && <SellerOrders seller={seller} />}
    </DashboardShell>
  );
}

function SellerOrders({ seller }: { seller: SellerContext }) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<Tab>("today");
  const updateOrderStatus = useDataStore((s) => s.updateOrderStatus);

  const grouped = useMemo(() => {
    const all = seller.orders;
    return {
      all,
      today: all.filter((o) => isToday(o.createdAt)),
      upcoming: all.filter((o) => o.status === "reserved" || o.status === "ready_for_pickup"),
      completed: all.filter((o) => o.status === "completed"),
    };
  }, [seller.orders]);

  const list = grouped[tab];

  return (
    <div className="space-y-5">
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "today", label: t("common.today"), count: grouped.today.length },
          { value: "upcoming", label: t("orders.upcoming"), count: grouped.upcoming.length },
          { value: "completed", label: t("orders.status.completed"), count: grouped.completed.length },
          { value: "all", label: t("common.all"), count: grouped.all.length },
        ]}
      />

      {!list.length ? (
        <EmptyState title={t("dashboard.noOrders")} />
      ) : (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>{t("checkout.orderNumber")}</th>
                <th>{t("dashboard.customer")}</th>
                <th>{t("common.date")}</th>
                <th>{t("offer.pickupWindow")}</th>
                <th>{t("dashboard.orderCode")}</th>
                <th>{t("common.total")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((order) => (
                <tr key={order.id}>
                  <td className="font-bold">{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{formatDate(order.createdAt, locale)}</td>
                  <td>
                    {formatTime(order.pickupWindowStart, locale)}–
                    {formatTime(order.pickupWindowEnd, locale)}
                  </td>
                  <td className="font-mono font-bold text-brand-700">{order.pickupCode}</td>
                  <td className="font-bold">{formatPrice(order.total, locale)}</td>
                  <td>
                    <Badge
                      tone={
                        order.status === "completed"
                          ? "green"
                          : order.status === "cancelled"
                            ? "red"
                            : "brand"
                      }
                    >
                      {t(`orders.status.${order.status}`)}
                    </Badge>
                  </td>
                  <td>
                    {(order.status === "reserved" || order.status === "ready_for_pickup") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, "completed")}
                      >
                        {t("dashboard.markCompleted")}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
