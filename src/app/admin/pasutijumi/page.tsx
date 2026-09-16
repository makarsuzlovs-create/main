"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Misc";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import type { Order } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

type Tab = "active" | "completed" | "cancelled" | "all";

export default function AdminOrdersPage() {
  const { t, locale } = useI18n();
  const orders = useDataStore((s) => s.orders);
  const updateOrderStatus = useDataStore((s) => s.updateOrderStatus);
  const [tab, setTab] = useState<Tab>("active");

  const grouped = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return {
      all: sorted,
      active: sorted.filter((o) => o.status === "reserved" || o.status === "ready_for_pickup"),
      completed: sorted.filter((o) => o.status === "completed"),
      cancelled: sorted.filter((o) => o.status === "cancelled" || o.status === "expired"),
    };
  }, [orders]);

  const list: Order[] = grouped[tab].slice(0, 100);

  return (
    <AdminShell title={t("admin.orders")}>
      <div className="space-y-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "active", label: t("orders.upcoming"), count: grouped.active.length },
            {
              value: "completed",
              label: t("orders.status.completed"),
              count: grouped.completed.length,
            },
            {
              value: "cancelled",
              label: t("orders.status.cancelled"),
              count: grouped.cancelled.length,
            },
            { value: "all", label: t("common.all"), count: grouped.all.length },
          ]}
        />

        <div className="table-wrap">
          <table className="table-base min-w-[860px]">
            <thead>
              <tr>
                <th>{t("checkout.orderNumber")}</th>
                <th>{t("dashboard.customer")}</th>
                <th>{t("offer.seller")}</th>
                <th>{t("common.date")}</th>
                <th>{t("common.total")}</th>
                <th>{t("offer.savedFood")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((order) => (
                <tr key={order.id}>
                  <td className="font-bold">{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.sellerName}</td>
                  <td>{formatDate(order.createdAt, locale)}</td>
                  <td className="font-bold">{formatPrice(order.total, locale)}</td>
                  <td>{order.savedFoodKg.toFixed(1)} kg</td>
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
                    {order.status !== "cancelled" && order.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, "cancelled")}
                      >
                        {t("orders.cancelOrder")}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
