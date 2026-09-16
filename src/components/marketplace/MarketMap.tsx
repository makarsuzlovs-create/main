"use client";

import { Info, Navigation, X } from "lucide-react";
import { useMemo, useState } from "react";
import { OfferCardCompact } from "@/components/marketplace/OfferCard";
import { useI18n } from "@/lib/i18n";
import type { OfferView } from "@/lib/hooks/useOffers";
import { useSessionStore } from "@/lib/store/sessionStore";
import { cn, formatDistance, formatPrice } from "@/lib/utils";

interface Pin {
  key: string;
  sellerId: string;
  sellerName: string;
  emoji: string;
  lat: number;
  lng: number;
  offers: OfferView[];
  minPrice: number;
  distance: number;
}

/**
 * Lightweight map visualisation for the prototype: offers are projected onto a
 * stylised canvas instead of loading a third-party map SDK. Swapping this for
 * Mapbox/Google/OSM only requires the same pin data.
 */
export function MarketMap({ offers, className }: { offers: OfferView[]; className?: string }) {
  const { t, locale } = useI18n();
  const userLocation = useSessionStore((s) => s.location);
  const [selected, setSelected] = useState<string | null>(null);

  const pins = useMemo<Pin[]>(() => {
    const map = new Map<string, Pin>();
    for (const offer of offers) {
      if (!offer.location) continue;
      const key = offer.location.id;
      if (!map.has(key)) {
        map.set(key, {
          key,
          sellerId: offer.sellerId,
          sellerName: offer.sellerName,
          emoji: offer.sellerEmoji,
          lat: offer.location.lat,
          lng: offer.location.lng,
          offers: [],
          minPrice: Number.POSITIVE_INFINITY,
          distance: offer.distance,
        });
      }
      const pin = map.get(key)!;
      pin.offers.push(offer);
      pin.minPrice = Math.min(pin.minPrice, offer.listing.discountedPrice);
    }
    return Array.from(map.values()).sort((a, b) => a.distance - b.distance);
  }, [offers]);

  const bounds = useMemo(() => {
    const lats = [...pins.map((p) => p.lat), userLocation.lat];
    const lngs = [...pins.map((p) => p.lng), userLocation.lng];
    const pad = 0.012;
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    };
  }, [pins, userLocation]);

  const project = (lat: number, lng: number) => ({
    left: `${((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 100}%`,
    top: `${(1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * 100}%`,
  });

  const active = pins.find((p) => p.key === selected);

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-sand-200", className)}>
      {/* Stylised backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#e9f2ec,#f7f3e8)]" aria-hidden />
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="#cfdfd4" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.7" />
        <path
          d="M-50 240 Q 200 180 420 300 T 900 260"
          fill="none"
          stroke="#c3d8e8"
          strokeWidth="18"
          opacity="0.7"
        />
        <path
          d="M120 -20 Q 180 200 300 420 T 460 820"
          fill="none"
          stroke="#e3dcc8"
          strokeWidth="12"
          opacity="0.8"
        />
      </svg>

      <div className="relative h-full min-h-[420px] w-full">
        {/* User location */}
        <span
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={project(userLocation.lat, userLocation.lng)}
        >
          <span className="relative flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
            <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-sky-500 text-white shadow">
              <Navigation size={10} />
            </span>
          </span>
        </span>

        {pins.map((pin) => (
          <button
            key={pin.key}
            onClick={() => setSelected(pin.key === selected ? null : pin.key)}
            className={cn(
              "absolute z-20 -translate-x-1/2 -translate-y-full transition",
              selected === pin.key ? "scale-110" : "hover:scale-105",
            )}
            style={project(pin.lat, pin.lng)}
          >
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full border-2 border-white px-2.5 py-1.5 text-xs font-extrabold shadow-lift",
                selected === pin.key ? "bg-ink-900 text-white" : "bg-white text-ink-900",
              )}
            >
              <span aria-hidden>{pin.emoji}</span>
              {formatPrice(pin.minPrice, locale)}
            </span>
            <span
              className={cn(
                "mx-auto block h-2 w-2 rotate-45 border-b-2 border-r-2 border-white",
                selected === pin.key ? "bg-ink-900" : "bg-white",
              )}
            />
          </button>
        ))}

        {!pins.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-ink-700 shadow">
              {t("browse.emptyTitle")}
            </p>
          </div>
        )}

        <p className="absolute bottom-3 left-3 z-10 flex max-w-[70%] items-start gap-1.5 rounded-xl bg-white/85 px-2.5 py-2 text-[11px] font-medium text-ink-600 backdrop-blur">
          <Info size={13} className="mt-0.5 shrink-0" />
          {t("browse.mapDisclaimer")}
        </p>
      </div>

      {active && (
        <div className="absolute inset-x-0 bottom-0 z-30 max-h-[65%] overflow-y-auto rounded-t-3xl border-t border-sand-200 bg-white p-4 shadow-lift animate-fade-in">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-ink-900">
                {active.emoji} {active.sellerName}
              </p>
              <p className="text-xs text-ink-600">
                {active.offers[0]?.location?.address} · {formatDistance(active.distance, locale)}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="rounded-full p-1.5 text-ink-600 hover:bg-sand-100"
              aria-label={t("common.close")}
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {active.offers.map((offer) => (
              <OfferCardCompact key={offer.listing.id} offer={offer} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
