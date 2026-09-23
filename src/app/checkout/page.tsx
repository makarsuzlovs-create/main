"use client";

import { Clock, CreditCard, Info, Lock, MapPin, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { pickupLabel } from "@/components/marketplace/OfferCard";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/Form";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { INTEGRATIONS } from "@/lib/config";
import { useOfferViews } from "@/lib/hooks/useOffers";
import { pick, useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";
import { cn, formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const cart = useSessionStore((s) => s.cart);
  const clearCart = useSessionStore((s) => s.clearCart);
  const setRedirect = useSessionStore((s) => s.setRedirectAfterLogin);
  const createOrders = useDataStore((s) => s.createOrdersFromCart);
  const offers = useOfferViews({ includeUnavailable: true });
  const [method, setMethod] = useState<"pay_on_pickup" | "card">("pay_on_pickup");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const lines = useMemo(
    () =>
      cart
        .map((item) => ({ item, offer: offers.find((o) => o.listing.id === item.listingId) }))
        .filter((l) => l.offer),
    [cart, offers],
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof lines>();
    for (const line of lines) {
      map.set(line.offer!.sellerId, [...(map.get(line.offer!.sellerId) ?? []), line]);
    }
    return Array.from(map.entries());
  }, [lines]);

  const total = lines.reduce(
    (sum, l) => sum + l.offer!.listing.discountedPrice * l.item.quantity,
    0,
  );
  const saved = lines.reduce(
    (sum, l) =>
      sum + (l.offer!.listing.originalPrice - l.offer!.listing.discountedPrice) * l.item.quantity,
    0,
  );

  if (!hydrated) {
    return (
      <div className="container-page py-8">
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title={t("cart.empty")}
          text={t("cart.emptyText")}
          actionLabel={t("cart.browseOffers")}
          actionHref="/piedavajumi"
        />
      </div>
    );
  }

  const placeOrder = () => {
    if (!user) return;
    setSubmitting(true);
    const result = createOrders(cart, user);
    if (!result.ok) {
      setError(t("cart.itemUnavailable"));
      setSubmitting(false);
      return;
    }
    clearCart();
    router.push(`/pasutijums?id=${result.orders[0].id}`);
  };

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-ink-900 sm:text-3xl">{t("checkout.title")}</h1>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* Order summary */}
          <section className="card p-5">
            <h2 className="mb-3 text-base font-extrabold text-ink-900">{t("checkout.summary")}</h2>
            <div className="space-y-4">
              {groups.map(([sellerId, group]) => {
                const first = group[0].offer!;
                return (
                  <div key={sellerId} className="rounded-2xl border border-sand-200 p-4">
                    <p className="text-sm font-extrabold text-ink-900">
                      {first.sellerEmoji} {first.sellerName}
                    </p>
                    <div className="mt-2 space-y-1.5 text-sm text-ink-700">
                      <p className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-brand-600" />
                        {first.location?.address}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock size={14} className="text-brand-600" />
                        {pickupLabel(first, t, locale)}
                      </p>
                    </div>
                    <ul className="mt-3 space-y-1.5 border-t border-sand-100 pt-3">
                      {group.map(({ item, offer }) => (
                        <li
                          key={item.listingId}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="min-w-0 truncate text-ink-800">
                            {item.quantity} ×{" "}
                            {pick(locale, offer!.listing.title, offer!.listing.titleEn)}
                          </span>
                          <span className="shrink-0 font-bold text-ink-900">
                            {formatPrice(offer!.listing.discountedPrice * item.quantity, locale)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Payment */}
          <section className="card p-5">
            <h2 className="mb-3 text-base font-extrabold text-ink-900">{t("checkout.payment")}</h2>
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-extrabold text-amber-800">
                  {t("checkout.paymentPlaceholderTitle")}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800/80">
                  {t("checkout.paymentPlaceholderText")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setMethod("pay_on_pickup")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition",
                  method === "pay_on_pickup"
                    ? "border-brand-500 bg-brand-50"
                    : "border-sand-200 hover:border-brand-300",
                )}
              >
                <Wallet size={18} className="text-brand-600" />
                <span className="text-sm font-bold text-ink-900">{t("checkout.payOnPickup")}</span>
              </button>
              <button
                disabled={!INTEGRATIONS.payments.enabled}
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-2xl border border-sand-200 bg-sand-50 p-4 text-left opacity-70"
              >
                <CreditCard size={18} className="text-ink-600" />
                <span className="text-sm font-bold text-ink-700">{t("checkout.payCard")}</span>
                <Lock size={14} className="ml-auto text-ink-600" />
              </button>
            </div>
          </section>

          {error && <FormMessage tone="error">{error}</FormMessage>}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-max">
          <div className="card space-y-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">{t("cart.subtotal")}</span>
              <span className="font-extrabold text-ink-900">{formatPrice(total, locale)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">{t("cart.youSave")}</span>
              <span className="font-extrabold text-clay-600">-{formatPrice(saved, locale)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-sand-100 pt-3">
              <span className="font-bold text-ink-900">{t("common.total")}</span>
              <span className="text-xl font-extrabold text-brand-700">
                {formatPrice(total, locale)}
              </span>
            </div>

            {user ? (
              <>
                <Button fullWidth size="lg" onClick={placeOrder} disabled={submitting}>
                  {t("checkout.placeOrder")}
                </Button>
                <p className="text-center text-xs text-ink-600">{t("checkout.orderTerms")}</p>
              </>
            ) : (
              <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
                <p className="text-sm font-extrabold text-ink-900">{t("checkout.loginRequired")}</p>
                <p className="mt-1 text-xs text-ink-600">{t("checkout.loginRequiredText")}</p>
                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    fullWidth
                    onClick={() => {
                      setRedirect("/checkout");
                      router.push("/ienakt");
                    }}
                  >
                    {t("nav.login")}
                  </Button>
                  <Button fullWidth variant="outline" href="/registreties">
                    {t("nav.register")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
