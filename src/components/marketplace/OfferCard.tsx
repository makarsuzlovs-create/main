"use client";

import { Clock, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { DiscountBadge } from "@/components/ui/Badge";
import { FoodImage } from "@/components/ui/FoodImage";
import { FavoriteButton } from "@/components/marketplace/FavoriteButton";
import { useI18n, pick } from "@/lib/i18n";
import { useSessionStore } from "@/lib/store/sessionStore";
import type { OfferView } from "@/lib/hooks/useOffers";
import {
  cn,
  formatDistance,
  formatPrice,
  formatTime,
  isToday,
  isTomorrow,
  unitLabel,
} from "@/lib/utils";

export function pickupLabel(
  offer: OfferView,
  t: (key: string, vars?: Record<string, string | number>) => string,
  locale: "lv" | "en",
) {
  const start = offer.listing.pickupWindowStart;
  const end = offer.listing.pickupWindowEnd;
  const day = isToday(start)
    ? t("offer.pickupToday")
    : isTomorrow(start)
      ? t("offer.pickupTomorrow")
      : `${t("offer.pickupOn")} ${new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-GB", {
          day: "2-digit",
          month: "short",
        }).format(new Date(start))}`;
  return `${day} ${formatTime(start, locale)}–${formatTime(end, locale)}`;
}

export function OfferCard({ offer, onAdd }: { offer: OfferView; onAdd?: () => void }) {
  const { t, locale } = useI18n();
  const addToCart = useSessionStore((s) => s.addToCart);
  const { listing } = offer;
  const low = listing.quantity > 0 && listing.quantity <= 2;

  return (
    <article className="card card-hover group relative flex flex-col overflow-hidden">
      <Link href={`/produkts/${listing.id}`} className="relative block h-40 w-full overflow-hidden">
        <FoodImage
          categorySlug={listing.categorySlug}
          src={listing.image || undefined}
          alt={pick(locale, listing.title, listing.titleEn)}
          className="transition duration-300 group-hover:scale-[1.03]"
          emojiClassName="text-6xl"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <DiscountBadge percent={offer.discount} />
          {listing.isSurpriseBag && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-violet-700 shadow-sm backdrop-blur">
              🎁 {t("offer.surpriseBag")}
            </span>
          )}
        </div>
        <FavoriteButton
          sellerId={offer.sellerId}
          sellerType={offer.sellerType}
          className="absolute right-3 top-3"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-ink-600">
          <span aria-hidden>{offer.sellerEmoji}</span>
          <span className="truncate">{offer.sellerName}</span>
          {offer.sellerRating && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 text-ink-700">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {offer.sellerRating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-[15px] font-extrabold leading-snug text-ink-900">
          <Link href={`/produkts/${listing.id}`} className="hover:text-brand-700">
            {pick(locale, listing.title, listing.titleEn)}
          </Link>
        </h3>

        <div className="mt-2 space-y-1 text-xs text-ink-600">
          <p className="flex items-center gap-1.5">
            <Clock size={13} className="shrink-0 text-brand-600" />
            <span className="truncate">{pickupLabel(offer, t, locale)}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin size={13} className="shrink-0 text-brand-600" />
            <span className="truncate">
              {offer.location?.address} · {formatDistance(offer.distance, locale)}
            </span>
          </p>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-brand-700">
                {formatPrice(listing.discountedPrice, locale)}
              </span>
              <span className="text-sm text-ink-600 line-through">
                {formatPrice(listing.originalPrice, locale)}
              </span>
            </div>
            <p
              className={cn(
                "mt-0.5 text-[11px] font-bold",
                low ? "text-clay-600" : "text-ink-600",
              )}
            >
              {low
                ? t("offer.onlyLeft", { count: listing.quantity })
                : `${t("offer.remaining")}: ${listing.quantity} ${unitLabel(listing.unit, locale)}`}
            </p>
          </div>
          <button
            onClick={() => {
              addToCart(listing.id, 1);
              onAdd?.();
            }}
            className="h-10 shrink-0 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            {t("offer.take")}
          </button>
        </div>
      </div>
    </article>
  );
}

export function OfferCardCompact({ offer }: { offer: OfferView }) {
  const { locale, t } = useI18n();
  const { listing } = offer;
  return (
    <Link
      href={`/produkts/${listing.id}`}
      className="card card-hover flex gap-3 overflow-hidden p-2.5"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <FoodImage
          categorySlug={listing.categorySlug}
          src={listing.image || undefined}
          alt={pick(locale, listing.title, listing.titleEn)}
          emojiClassName="text-3xl"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-ink-600">{offer.sellerName}</p>
        <h4 className="truncate text-sm font-extrabold text-ink-900">
          {pick(locale, listing.title, listing.titleEn)}
        </h4>
        <p className="mt-0.5 truncate text-[11px] text-ink-600">{pickupLabel(offer, t, locale)}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-extrabold text-brand-700">
            {formatPrice(listing.discountedPrice, locale)}
          </span>
          <span className="text-xs text-ink-600 line-through">
            {formatPrice(listing.originalPrice, locale)}
          </span>
          <DiscountBadge percent={offer.discount} className="ml-auto" />
        </div>
      </div>
    </Link>
  );
}
