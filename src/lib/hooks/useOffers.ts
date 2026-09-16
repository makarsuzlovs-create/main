"use client";

import { useMemo } from "react";
import { useDataStore } from "../store/dataStore";
import { useSessionStore } from "../store/sessionStore";
import type { Listing, Location, SellerType } from "../types";
import { discountPercent, distanceKm, isListingAvailable } from "../utils";

export interface OfferView {
  listing: Listing;
  location: Location | undefined;
  sellerId: string;
  sellerType: SellerType;
  sellerName: string;
  sellerEmoji: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  sellerVerified: boolean;
  distance: number;
  discount: number;
  available: boolean;
}

/**
 * Enriches listings with seller, location and distance, mirroring what a
 * backend endpoint would return for the marketplace.
 */
export function useOfferViews(options?: { includeUnavailable?: boolean }) {
  const listings = useDataStore((s) => s.listings);
  const businesses = useDataStore((s) => s.businesses);
  const households = useDataStore((s) => s.households);
  const locations = useDataStore((s) => s.locations);
  const userLocation = useSessionStore((s) => s.location);

  return useMemo(() => {
    const now = new Date();
    const views: OfferView[] = listings.map((listing) => {
      const location = locations.find((l) => l.id === listing.locationId);
      const business =
        listing.sellerType === "business"
          ? businesses.find((b) => b.id === listing.sellerId)
          : undefined;
      const household =
        listing.sellerType === "household"
          ? households.find((h) => h.id === listing.sellerId)
          : undefined;
      const verification = business?.verificationStatus ?? household?.verificationStatus;
      return {
        listing,
        location,
        sellerId: listing.sellerId,
        sellerType: listing.sellerType,
        sellerName: business?.companyName ?? household?.displayName ?? "—",
        sellerEmoji: business?.logoEmoji ?? "🏡",
        sellerRating: business?.rating,
        sellerReviewCount: business?.reviewCount,
        sellerVerified: verification === "approved",
        distance: location ? distanceKm(userLocation, location) : Number.POSITIVE_INFINITY,
        discount: discountPercent(listing.originalPrice, listing.discountedPrice),
        available: isListingAvailable(listing, now) && verification === "approved",
      };
    });
    return options?.includeUnavailable ? views : views.filter((v) => v.available);
  }, [listings, businesses, households, locations, userLocation, options?.includeUnavailable]);
}

export function useOfferView(listingId: string): OfferView | undefined {
  const views = useOfferViews({ includeUnavailable: true });
  return views.find((v) => v.listing.id === listingId);
}

export interface SellerView {
  id: string;
  type: SellerType;
  name: string;
  emoji: string;
  rating?: number;
  reviewCount?: number;
  categorySlug: string;
  locations: Location[];
  offers: OfferView[];
}

/** Groups available offers by seller — used by the map and favourites. */
export function useSellerViews() {
  const offers = useOfferViews();
  const businesses = useDataStore((s) => s.businesses);
  const locations = useDataStore((s) => s.locations);

  return useMemo(() => {
    const map = new Map<string, SellerView>();
    for (const offer of offers) {
      const key = offer.sellerId;
      if (!map.has(key)) {
        const business = businesses.find((b) => b.id === key);
        map.set(key, {
          id: key,
          type: offer.sellerType,
          name: offer.sellerName,
          emoji: offer.sellerEmoji,
          rating: offer.sellerRating,
          reviewCount: offer.sellerReviewCount,
          categorySlug: business?.categorySlug ?? offer.listing.categorySlug,
          locations: locations.filter((l) => l.sellerId === key),
          offers: [],
        });
      }
      map.get(key)!.offers.push(offer);
    }
    return Array.from(map.values());
  }, [offers, businesses, locations]);
}
