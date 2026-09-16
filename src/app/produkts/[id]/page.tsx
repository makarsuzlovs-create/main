"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Info,
  Leaf,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarketMap } from "@/components/marketplace/MarketMap";
import { FavoriteButton } from "@/components/marketplace/FavoriteButton";
import { OfferCardCompact, pickupLabel } from "@/components/marketplace/OfferCard";
import { Badge, DiscountBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FoodImage } from "@/components/ui/FoodImage";
import { EmptyState, Skeleton, Toast } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { categoryName } from "@/lib/data/categories";
import { useOfferView, useOfferViews } from "@/lib/hooks/useOffers";
import { pick, useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/store/sessionStore";
import { formatDate, formatDistance, formatPrice, unitLabel } from "@/lib/utils";

export default function ProductPage({ params }: { params: { id: string } }) {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const router = useRouter();
  const offer = useOfferView(params.id);
  const allOffers = useOfferViews();
  const addToCart = useSessionStore((s) => s.addToCart);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1.3fr_1fr]">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title={t("offer.outOfStockTitle")}
          text={t("offer.outOfStockText")}
          actionLabel={t("home.heroCta")}
          actionHref="/piedavajumi"
        />
      </div>
    );
  }

  const { listing } = offer;
  const otherOffers = allOffers.filter(
    (o) => o.sellerId === offer.sellerId && o.listing.id !== listing.id,
  );
  const maxQuantity = Math.max(1, Math.min(listing.quantity, 5));
  const savedAmount = (listing.originalPrice - listing.discountedPrice) * quantity;

  return (
    <div className="container-page py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeft size={16} /> {t("common.back")}
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        {/* Left column */}
        <div>
          <div className="relative h-64 overflow-hidden rounded-3xl sm:h-96">
            <FoodImage
              categorySlug={listing.categorySlug}
              src={listing.image || undefined}
              alt={pick(locale, listing.title, listing.titleEn)}
              emojiClassName="text-8xl"
            />
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              <DiscountBadge percent={offer.discount} className="text-sm" />
              {listing.isSurpriseBag && (
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-violet-700 shadow">
                  🎁 {t("offer.surpriseBag")}
                </span>
              )}
            </div>
            <FavoriteButton
              sellerId={offer.sellerId}
              sellerType={offer.sellerType}
              className="absolute right-4 top-4 h-11 w-11"
              size={20}
            />
          </div>

          <div className="mt-6">
            <Link
              href={`/piedavajumi?q=${encodeURIComponent(offer.sellerName)}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-ink-700 hover:text-brand-700"
            >
              <span aria-hidden>{offer.sellerEmoji}</span>
              {offer.sellerName}
              {offer.sellerVerified && <ShieldCheck size={15} className="text-brand-600" />}
            </Link>
            <h1 className="mt-2 text-2xl font-extrabold text-ink-900 sm:text-3xl">
              {pick(locale, listing.title, listing.titleEn)}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-600">
              {offer.sellerRating && (
                <span className="inline-flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <strong className="text-ink-800">{offer.sellerRating.toFixed(1)}</strong>
                  <span>
                    ({offer.sellerReviewCount} {t("offer.reviews")})
                  </span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} className="text-brand-600" />
                {formatDistance(offer.distance, locale)}
              </span>
              <Badge tone="brand">{categoryName(listing.categorySlug, locale)}</Badge>
            </div>

            <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-ink-700">
              {pick(locale, listing.description, listing.descriptionEn)}
            </p>
            {listing.isSurpriseBag && (
              <p className="mt-2 text-sm italic text-ink-600">{t("offer.surpriseBagInfo")}</p>
            )}
          </div>

          {/* Dates, allergens, storage */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div
              className={
                listing.dateLabelType === "use_by"
                  ? "rounded-2xl border border-amber-200 bg-amber-50 p-4"
                  : "rounded-2xl border border-sand-200 bg-white p-4"
              }
            >
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-ink-700">
                {listing.dateLabelType === "use_by" ? (
                  <AlertTriangle size={14} className="text-amber-600" />
                ) : (
                  <Info size={14} className="text-brand-600" />
                )}
                {listing.dateLabelType === "use_by" ? t("offer.useBy") : t("offer.bestBefore")}
              </p>
              <p className="mt-1.5 text-lg font-extrabold text-ink-900">
                {formatDate(listing.bestBeforeDate, locale)}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                {listing.dateLabelType === "use_by"
                  ? t("offer.useByWarning")
                  : t("offer.bestBeforeInfo")}
              </p>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700">
                {t("offer.allergens")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {listing.allergens.length ? (
                  listing.allergens.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold text-ink-700"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-ink-600">{t("common.none")}</span>
                )}
              </div>
              <p className="mt-3 text-xs font-extrabold uppercase tracking-wide text-ink-700">
                {t("offer.storage")}
              </p>
              <p className="mt-1 text-sm text-ink-700">{listing.storageRequirements}</p>
            </div>
          </div>

          {/* Why is this here */}
          <section className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-5">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-brand-800">
              <Leaf size={18} /> {t("offer.whyHereTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-900/80">{t("offer.whyHereText")}</p>
          </section>

          {/* Map */}
          <section className="mt-6">
            <h2 className="mb-3 text-base font-extrabold text-ink-900">{t("offer.pickupAddress")}</h2>
            <MarketMap offers={[offer]} className="h-72" />
          </section>

          {otherOffers.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-base font-extrabold text-ink-900">{t("offer.otherOffers")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {otherOffers.map((o) => (
                  <OfferCardCompact key={o.listing.id} offer={o} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Purchase panel */}
        <aside className="lg:sticky lg:top-24 lg:h-max">
          <div className="card space-y-4 p-5">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-brand-700">
                {formatPrice(listing.discountedPrice, locale)}
              </span>
              <span className="pb-1 text-base text-ink-600 line-through">
                {formatPrice(listing.originalPrice, locale)}
              </span>
              <DiscountBadge percent={offer.discount} className="mb-1.5 ml-auto" />
            </div>

            <div className="space-y-2.5 rounded-2xl bg-sand-50 p-4 text-sm">
              <InfoRow
                icon={<Clock size={15} />}
                label={t("offer.pickupWindow")}
                value={pickupLabel(offer, t, locale)}
              />
              <InfoRow
                icon={<MapPin size={15} />}
                label={t("offer.pickupAddress")}
                value={`${offer.location?.address ?? ""} · ${formatDistance(offer.distance, locale)}`}
              />
              <InfoRow
                icon={<Info size={15} />}
                label={t("offer.quantity")}
                value={`${listing.quantity} ${unitLabel(listing.unit, locale)}`}
              />
            </div>

            {offer.available ? (
              <>
                <div className="flex items-center justify-between rounded-2xl border border-sand-200 p-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-ink-800 transition hover:bg-sand-200"
                    aria-label="-"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-lg font-extrabold text-ink-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-ink-800 transition hover:bg-sand-200"
                    aria-label="+"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  onClick={() => {
                    addToCart(listing.id, quantity);
                    setToast(t("offer.addToCart"));
                  }}
                >
                  {t("offer.reserve")} · {formatPrice(listing.discountedPrice * quantity, locale)}
                </Button>
                <Button fullWidth variant="outline" href="/grozs">
                  {t("nav.cart")}
                </Button>
                <p className="text-center text-xs font-semibold text-brand-700">
                  {t("offer.saveAmount", { amount: formatPrice(savedAmount, locale) })} ·{" "}
                  {t("offer.savedFood")}: {(listing.estimatedWeightKg * quantity).toFixed(1)} kg
                </p>
              </>
            ) : (
              <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4 text-center">
                <p className="text-sm font-extrabold text-ink-900">{t("offer.outOfStockTitle")}</p>
                <p className="mt-1 text-xs text-ink-600">{t("offer.outOfStockText")}</p>
                <div className="mt-3">
                  <Button href="/piedavajumi" variant="outline" size="sm">
                    {t("home.heroCta")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-brand-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-600">{label}</p>
        <p className="text-sm font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}
