"use client";

import { useMemo } from "react";
import { SELLER_RULES } from "../config";
import { sellerLimits, useDataStore } from "../store/dataStore";
import { useSessionStore } from "../store/sessionStore";
import type { SellerType } from "../types";
import { effectiveStatus } from "../utils";

/**
 * Everything a seller dashboard page needs: identity, verification state,
 * rule set, listings, orders and the current subscription.
 */
export function useSeller() {
  const user = useSessionStore((s) => s.user);
  const state = useDataStore();

  return useMemo(() => {
    if (!user || (user.role !== "business" && user.role !== "household")) {
      return null;
    }
    const sellerType: SellerType = user.role === "business" ? "business" : "household";
    const sellerId = (user.businessId ?? user.householdSellerId)!;
    const business = state.businesses.find((b) => b.id === sellerId);
    const household = state.households.find((h) => h.id === sellerId);
    const listings = state.listings.filter(
      (l) => l.sellerId === sellerId && l.status !== "removed",
    );
    const now = new Date();
    const activeListings = listings.filter((l) => effectiveStatus(l, now) === "active");
    const orders = state.orders
      .filter((o) => o.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const locations = state.locations.filter((l) => l.sellerId === sellerId);
    const subscription = state.subscriptions.find(
      (s) => s.sellerId === sellerId && s.status !== "cancelled",
    );
    const plan = state.plans.find((p) => p.id === subscription?.planId);
    const invoices = state.invoices
      .filter((i) => i.sellerId === sellerId)
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    return {
      user,
      sellerType,
      sellerId,
      business,
      household,
      displayName: business?.companyName ?? household?.displayName ?? "",
      verificationStatus: business?.verificationStatus ?? household?.verificationStatus ?? "pending",
      rules: SELLER_RULES[sellerType],
      limits: sellerLimits(state, sellerType, sellerId),
      listings,
      activeListings,
      orders,
      locations,
      subscription,
      plan,
      invoices,
    };
  }, [user, state]);
}

export type SellerContext = NonNullable<ReturnType<typeof useSeller>>;
