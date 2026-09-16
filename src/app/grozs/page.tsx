"use client";

import { Clock, MapPin, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { pickupLabel } from "@/components/marketplace/OfferCard";
import { Button } from "@/components/ui/Button";
import { FoodImage } from "@/components/ui/FoodImage";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { useOfferViews } from "@/lib/hooks/useOffers";
import { pick, useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/store/sessionStore";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const cart = useSessionStore((s) => s.cart);
  const setCartQuantity = useSessionStore((s) => s.setCartQuantity);
  const removeFromCart = useSessionStore((s) => s.removeFromCart);
  const offers = useOfferViews({ includeUnavailable: true });

  const lines = useMemo(
    () =>
      cart
        .map((item) => ({ item, offer: offers.find((o) => o.listing.id === item.listingId) }))
        .filter((line) => line.offer),
    [cart, offers],
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof lines>();
    for (const line of lines) {
      const key = line.offer!.sellerId;
      map.set(key, [...(map.get(key) ?? []), line]);
    }
    return Array.from(map.entries());
  }, [lines]);

  const subtotal = lines.reduce(
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
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-ink-900 sm:text-3xl">{t("cart.title")}</h1>

      {!lines.length ? (
        <EmptyState
          icon={<ShoppingBag size={28} />}
          title={t("cart.empty")}
          text={t("cart.emptyText")}
          actionLabel={t("cart.browseOffers")}
          actionHref="/piedavajumi"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            {groups.length > 1 && (
              <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
                {t("cart.multipleSellers")}
              </p>
            )}
            {groups.map(([sellerId, group]) => {
              const first = group[0].offer!;
              return (
                <div key={sellerId} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2 border-b border-sand-100 bg-sand-50/60 px-4 py-3">
                    <span aria-hidden>{first.sellerEmoji}</span>
                    <span className="text-sm font-extrabold text-ink-900">{first.sellerName}</span>
                    <span className="ml-auto flex items-center gap-1.5 text-xs text-ink-600">
                      <Clock size={13} /> {pickupLabel(first, t, locale)}
                    </span>
                  </div>
                  <ul>
                    {group.map(({ item, offer }) => {
                      const listing = offer!.listing;
                      return (
                        <li
                          key={item.listingId}
                          className="flex gap-3 border-b border-sand-100 p-4 last:border-b-0"
                        >
                          <Link
                            href={`/produkts/${listing.id}`}
                            className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                          >
                            <FoodImage
                              categorySlug={listing.categorySlug}
                              alt={listing.title}
                              emojiClassName="text-3xl"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/produkts/${listing.id}`}
                              className="line-clamp-1 text-sm font-extrabold text-ink-900 hover:text-brand-700"
                            >
                              {pick(locale, listing.title, listing.titleEn)}
                            </Link>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-600">
                              <MapPin size={12} /> {offer!.location?.address}
                            </p>
                            {!offer!.available && (
                              <p className="mt-1 text-xs font-bold text-clay-600">
                                {t("cart.itemUnavailable")}
                              </p>
                            )}
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <div className="inline-flex items-center gap-1 rounded-xl border border-sand-200 p-1">
                                <button
                                  onClick={() =>
                                    setCartQuantity(item.listingId, item.quantity - 1)
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand-100 hover:bg-sand-200"
                                  aria-label="-"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-7 text-center text-sm font-extrabold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    setCartQuantity(
                                      item.listingId,
                                      Math.min(listing.quantity, item.quantity + 1),
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand-100 hover:bg-sand-200"
                                  aria-label="+"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-extrabold text-brand-700">
                                  {formatPrice(listing.discountedPrice * item.quantity, locale)}
                                </p>
                                <p className="text-xs text-ink-600 line-through">
                                  {formatPrice(listing.originalPrice * item.quantity, locale)}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.listingId)}
                                className="rounded-lg p-2 text-ink-600 transition hover:bg-red-50 hover:text-red-600"
                                aria-label={t("cart.remove")}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-max">
            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-600">{t("cart.subtotal")}</span>
                <span className="font-extrabold text-ink-900">{formatPrice(subtotal, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-600">{t("cart.youSave")}</span>
                <span className="font-extrabold text-clay-600">-{formatPrice(saved, locale)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-sand-100 pt-3 text-base">
                <span className="font-bold text-ink-900">{t("common.total")}</span>
                <span className="text-xl font-extrabold text-brand-700">
                  {formatPrice(subtotal, locale)}
                </span>
              </div>
              <Button href="/checkout" fullWidth size="lg">
                {t("cart.checkout")}
              </Button>
              <Button href="/piedavajumi" fullWidth variant="ghost">
                {t("cart.browseOffers")}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
