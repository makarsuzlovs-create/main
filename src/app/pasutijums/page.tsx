"use client";

import { CheckCircle2, Clock, Leaf, MapPin, Ticket } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { formatPrice, formatTime, formatDate } from "@/lib/utils";

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-10">
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      }
    >
      <OrderConfirmation />
    </Suspense>
  );
}

function OrderConfirmation() {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const orderId = useSearchParams().get("id") ?? "";
  const order = useDataStore((s) => s.orders.find((o) => o.id === orderId));

  if (!hydrated) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title={t("orders.empty")}
          text={t("orders.emptyText")}
          actionLabel={t("cart.browseOffers")}
          actionHref="/piedavajumi"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <div className="card overflow-hidden">
          <div className="bg-brand-600 px-6 py-8 text-center text-white">
            <CheckCircle2 size={44} className="mx-auto" />
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">{t("checkout.confirmedTitle")}</h1>
            <p className="mt-1.5 text-sm text-brand-50/90">{t("checkout.confirmedText")}</p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-sand-200 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-600">
                {t("checkout.orderNumber")}
              </p>
              <p className="mt-1 text-lg font-extrabold text-ink-900">{order.orderNumber}</p>
            </div>
            <div className="rounded-2xl border-2 border-brand-500 bg-brand-50 p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-700">
                <Ticket size={14} /> {t("checkout.pickupCode")}
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-[0.2em] text-brand-800">
                {order.pickupCode}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-sand-100 px-6 py-5">
            <p className="text-sm font-extrabold text-ink-900">{order.sellerName}</p>
            <p className="flex items-start gap-2 text-sm text-ink-700">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
              {order.pickupAddress}
            </p>
            <p className="flex items-start gap-2 text-sm text-ink-700">
              <Clock size={16} className="mt-0.5 shrink-0 text-brand-600" />
              {formatDate(order.pickupWindowStart, locale)} {formatTime(order.pickupWindowStart, locale)}
              –{formatTime(order.pickupWindowEnd, locale)}
            </p>

            <ul className="mt-3 space-y-1.5 border-t border-sand-100 pt-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-ink-800">
                    {item.quantity} × {item.titleSnapshot}
                  </span>
                  <span className="shrink-0 font-bold text-ink-900">
                    {formatPrice(item.unitPrice * item.quantity, locale)}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 border-t border-sand-100 pt-2 text-base">
                <span className="font-bold text-ink-900">{t("common.total")}</span>
                <span className="font-extrabold text-brand-700">
                  {formatPrice(order.total, locale)}
                </span>
              </li>
            </ul>
          </div>

          <div className="mx-6 mb-6 flex items-start gap-2.5 rounded-2xl bg-brand-50 p-4">
            <Leaf size={18} className="mt-0.5 shrink-0 text-brand-600" />
            <p className="text-sm font-semibold text-brand-800">
              {t("checkout.savedWithOrder", {
                kg: order.savedFoodKg.toFixed(1),
                amount: formatPrice(order.savedAmount, locale),
              })}
            </p>
          </div>

          <div className="flex flex-col gap-2 px-6 pb-6 sm:flex-row">
            <Button href="/pasutijumi" fullWidth>
              {t("checkout.viewOrders")}
            </Button>
            <Button href="/piedavajumi" variant="outline" fullWidth>
              {t("checkout.keepBrowsing")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
