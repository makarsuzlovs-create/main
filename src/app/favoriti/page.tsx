"use client";

import { Heart, Star } from "lucide-react";
import { useMemo } from "react";
import { FavoriteButton } from "@/components/marketplace/FavoriteButton";
import { OfferCardCompact } from "@/components/marketplace/OfferCard";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { useOfferViews } from "@/lib/hooks/useOffers";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function FavoritesPage() {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const user = useSessionStore((s) => s.user);
  const favorites = useDataStore((s) => s.favorites);
  const businesses = useDataStore((s) => s.businesses);
  const households = useDataStore((s) => s.households);
  const offers = useOfferViews();

  const saved = useMemo(() => {
    if (!user) return [];
    return favorites
      .filter((f) => f.userId === user.id)
      .map((f) => {
        const business = businesses.find((b) => b.id === f.sellerId);
        const household = households.find((h) => h.id === f.sellerId);
        return {
          favorite: f,
          name: business?.companyName ?? household?.displayName ?? "—",
          emoji: business?.logoEmoji ?? "🏡",
          rating: business?.rating,
          reviewCount: business?.reviewCount,
          description: business?.description,
          offers: offers.filter((o) => o.sellerId === f.sellerId),
        };
      });
  }, [favorites, user, businesses, households, offers]);

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
          icon={<Heart size={28} />}
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
      <h1 className="mb-5 text-2xl font-extrabold text-ink-900 sm:text-3xl">
        {t("favorites.title")}
      </h1>

      {!saved.length ? (
        <EmptyState
          icon={<Heart size={28} />}
          title={t("favorites.empty")}
          text={t("favorites.emptyText")}
          actionLabel={t("cart.browseOffers")}
          actionHref="/piedavajumi"
        />
      ) : (
        <div className="space-y-5">
          {saved.map((seller) => (
            <section key={seller.favorite.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
                    <span aria-hidden>{seller.emoji}</span>
                    <span className="truncate">{seller.name}</span>
                  </h2>
                  {seller.rating && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-600">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {seller.rating.toFixed(1)} ({seller.reviewCount} {t("offer.reviews")})
                    </p>
                  )}
                  {seller.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-ink-600">{seller.description}</p>
                  )}
                </div>
                <FavoriteButton
                  sellerId={seller.favorite.sellerId}
                  sellerType={seller.favorite.sellerType}
                />
              </div>

              {seller.offers.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {seller.offers.map((offer) => (
                    <OfferCardCompact key={offer.listing.id} offer={offer} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-sand-50 px-4 py-3 text-sm text-ink-600">
                  {t("browse.emptyTitle")}
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
