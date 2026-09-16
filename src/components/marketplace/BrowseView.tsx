"use client";

import { List, Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MarketMap } from "@/components/marketplace/MarketMap";
import { OfferCard } from "@/components/marketplace/OfferCard";
import { Button } from "@/components/ui/Button";
import { CardSkeletonGrid, EmptyState, Toast } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { useOfferViews } from "@/lib/hooks/useOffers";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { cn, isToday, isTomorrow } from "@/lib/utils";

type Sort = "distance" | "discount" | "price" | "pickup";
type PickupFilter = "any" | "today" | "tomorrow";

export function BrowseView({ defaultView = "list" }: { defaultView?: "list" | "map" }) {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const router = useRouter();
  const params = useSearchParams();
  const offers = useOfferViews();
  const categories = useDataStore((s) => s.categories);

  const [view, setView] = useState<"list" | "map">(defaultView);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("kategorija") ?? "");
  const [sort, setSort] = useState<Sort>("distance");
  const [maxPrice, setMaxPrice] = useState(20);
  const [minDiscount, setMinDiscount] = useState(0);
  const [pickup, setPickup] = useState<PickupFilter>("any");
  const [sellerTypes, setSellerTypes] = useState<{ business: boolean; household: boolean }>({
    business: true,
    household: true,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
    setCategory(params.get("kategorija") ?? "");
  }, [params]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = offers.filter((offer) => {
      const { listing } = offer;
      if (q) {
        const haystack = `${listing.title} ${listing.titleEn ?? ""} ${offer.sellerName} ${listing.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (category && listing.categorySlug !== category) return false;
      if (listing.discountedPrice > maxPrice) return false;
      if (offer.discount < minDiscount) return false;
      if (pickup === "today" && !isToday(listing.pickupWindowStart)) return false;
      if (pickup === "tomorrow" && !isTomorrow(listing.pickupWindowStart)) return false;
      if (!sellerTypes[offer.sellerType]) return false;
      return true;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "discount":
          return b.discount - a.discount;
        case "price":
          return a.listing.discountedPrice - b.listing.discountedPrice;
        case "pickup":
          return (
            new Date(a.listing.pickupWindowStart).getTime() -
            new Date(b.listing.pickupWindowStart).getTime()
          );
        default:
          return a.distance - b.distance;
      }
    });
  }, [offers, query, category, maxPrice, minDiscount, pickup, sellerTypes, sort]);

  const activeFilterCount =
    (category ? 1 : 0) +
    (maxPrice < 20 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (pickup !== "any" ? 1 : 0) +
    (!sellerTypes.business || !sellerTypes.household ? 1 : 0);

  const resetFilters = () => {
    setCategory("");
    setMaxPrice(20);
    setMinDiscount(0);
    setPickup("any");
    setSellerTypes({ business: true, household: true });
    router.replace(query ? `/piedavajumi?q=${encodeURIComponent(query)}` : "/piedavajumi");
  };

  return (
    <div className="container-page py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{t("browse.title")}</h1>
          <p className="mt-1 text-sm text-ink-600">
            {hydrated ? t("browse.resultsCount", { count: filtered.length }) : t("common.loading")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-sand-200 bg-white p-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition",
                view === "list" ? "bg-brand-600 text-white" : "text-ink-700",
              )}
            >
              <List size={15} /> {t("nav.list")}
            </button>
            <button
              onClick={() => setView("map")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition",
                view === "map" ? "bg-brand-600 text-white" : "text-ink-700",
              )}
            >
              <MapIcon size={15} /> {t("nav.map")}
            </button>
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn("chip lg:hidden", activeFilterCount > 0 && "chip-active")}
          >
            <SlidersHorizontal size={15} />
            {t("common.filter")}
            {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
          </button>
        </div>
      </div>

      {/* Category rail */}
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        <button
          onClick={() => setCategory("")}
          className={cn("chip whitespace-nowrap", !category && "chip-active")}
        >
          {t("common.all")}
        </button>
        {categories
          .filter((c) => c.isActive)
          .map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug === category ? "" : c.slug)}
              className={cn("chip whitespace-nowrap", category === c.slug && "chip-active")}
            >
              <span aria-hidden>{c.emoji}</span>
              {locale === "lv" ? c.nameLv : c.nameEn}
            </button>
          ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
        {/* Filters */}
        <aside
          className={cn(
            "card h-max space-y-5 p-5 lg:sticky lg:top-24",
            filtersOpen ? "block" : "hidden lg:block",
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
              {t("common.filter")}
            </h2>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-clay-600"
              >
                <X size={13} /> {t("common.clear")}
              </button>
            )}
          </div>

          <div>
            <label className="label">{t("browse.sortBy")}</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="field"
            >
              <option value="distance">{t("browse.sortDistance")}</option>
              <option value="discount">{t("browse.sortDiscount")}</option>
              <option value="price">{t("browse.sortPrice")}</option>
              <option value="pickup">{t("browse.sortPickup")}</option>
            </select>
          </div>

          <div>
            <label className="label">
              {t("browse.maxPrice")}: €{maxPrice}
            </label>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>

          <div>
            <label className="label">
              {t("browse.minDiscount")}: {minDiscount}%
            </label>
            <input
              type="range"
              min={0}
              max={80}
              step={10}
              value={minDiscount}
              onChange={(e) => setMinDiscount(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>

          <div>
            <label className="label">{t("browse.pickupTime")}</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["any", t("browse.anyTime")],
                  ["today", t("browse.todayOnly")],
                  ["tomorrow", t("browse.tomorrowOnly")],
                ] as [PickupFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setPickup(value)}
                  className={cn("chip", pickup === value && "chip-active")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">{t("browse.sellerType")}</label>
            <div className="space-y-2">
              {(
                [
                  ["business", t("browse.businesses")],
                  ["household", t("browse.households")],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 text-sm font-semibold text-ink-800">
                  <input
                    type="checkbox"
                    checked={sellerTypes[key]}
                    onChange={(e) => setSellerTypes((s) => ({ ...s, [key]: e.target.checked }))}
                    className="h-4.5 w-4.5 rounded border-sand-300 text-brand-600 focus:ring-brand-200"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          {!hydrated ? (
            <CardSkeletonGrid count={6} />
          ) : view === "map" ? (
            <MarketMap offers={filtered} className="h-[620px]" />
          ) : filtered.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((offer) => (
                <OfferCard
                  key={offer.listing.id}
                  offer={offer}
                  onAdd={() => setToast(t("offer.addToCart"))}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("browse.emptyTitle")}
              text={t("browse.emptyText")}
              actionLabel={t("common.clear")}
              onAction={resetFilters}
            />
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-4 lg:hidden">
          <Button fullWidth onClick={() => setFiltersOpen(false)}>
            {t("common.apply")}
          </Button>
        </div>
      )}

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
