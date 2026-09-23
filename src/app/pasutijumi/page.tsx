"use client";

import { Clock, MapPin, Package, Ticket } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton, Tabs } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";
import type { Order } from "@/lib/types";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";

const STATUS_TONES: Record<Order["status"], "brand" | "green" | "amber" | "red" | "neutral"> = {
  pending_payment: "amber",
  reserved: "brand",
  ready_for_pickup: "brand",
  completed: "green",
  cancelled: "red",
  expired: "neutral",
};

export default function OrdersPage() {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const user = useSessionStore((s) => s.user);
  const orders = useDataStore((s) => s.orders);
  const updateOrderStatus = useDataStore((s) => s.updateOrderStatus);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const mine = useMemo(
    () =>
      orders
        .filter((o) => user && o.customerUserId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders, user],
  );

  const upcoming = mine.filter((o) => o.status === "reserved" || o.status === "ready_for_pickup");
  const past = mine.filter((o) => !["reserved", "ready_for_pickup"].includes(o.status));
  const list = tab === "upcoming" ? upcoming : past;

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
          icon={<Package size={28} />}
          title={t("profile.guestTitle")}
          text={t("profile.guestText")}
          actionLabel={t("nav.login")}
          actionHref="/ienakt"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-5 text-2xl font-extrabold text-ink-900 sm:text-3xl">{t("orders.title")}</h1>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "upcoming", label: t("orders.upcoming"), count: upcoming.length },
          { value: "past", label: t("orders.past"), count: past.length },
        ]}
      />

      {!list.length ? (
        <EmptyState
          icon={<Package size={28} />}
          title={t("orders.empty")}
          text={t("orders.emptyText")}
          actionLabel={t("cart.browseOffers")}
          actionHref="/piedavajumi"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((order) => (
            <article key={order.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-extrabold text-ink-900">{order.sellerName}</p>
                  <p className="text-xs text-ink-600">
                    {order.orderNumber} · {formatDate(order.createdAt, locale)}
                  </p>
                </div>
                <Badge tone={STATUS_TONES[order.status]}>
                  {t(`orders.status.${order.status}`)}
                </Badge>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-ink-700">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <Link
                      href={`/produkts?id=${item.listingId}`}
                      className="min-w-0 truncate hover:text-brand-700"
                    >
                      {item.quantity} × {item.titleSnapshot}
                    </Link>
                    <span className="shrink-0 font-bold">
                      {formatPrice(item.unitPrice * item.quantity, locale)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 space-y-1.5 rounded-2xl bg-sand-50 p-3 text-xs text-ink-700">
                <p className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-brand-600" /> {order.pickupAddress}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock size={13} className="text-brand-600" />
                  {formatDate(order.pickupWindowStart, locale)}{" "}
                  {formatTime(order.pickupWindowStart, locale)}–
                  {formatTime(order.pickupWindowEnd, locale)}
                </p>
                {(order.status === "reserved" || order.status === "ready_for_pickup") && (
                  <p className="flex items-center gap-1.5 font-extrabold text-brand-700">
                    <Ticket size={13} /> {t("checkout.pickupCode")}: {order.pickupCode}
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-brand-700">
                  {formatPrice(order.total, locale)}
                </span>
                {(order.status === "reserved" || order.status === "ready_for_pickup") && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                    >
                      {t("orders.cancelOrder")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, "completed")}
                    >
                      {t("orders.markCollected")}
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
