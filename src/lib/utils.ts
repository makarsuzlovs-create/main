import type { Listing, Locale, Unit } from "./types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatPrice(value: number, locale: Locale = "lv") {
  return new Intl.NumberFormat(locale === "lv" ? "lv-LV" : "en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, locale: Locale = "lv", digits = 0) {
  return new Intl.NumberFormat(locale === "lv" ? "lv-LV" : "en-IE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function discountPercent(original: number, discounted: number) {
  if (!original || original <= 0) return 0;
  return Math.round((1 - discounted / original) * 100);
}

export function formatTime(iso: string, locale: Locale = "lv") {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDate(iso: string, locale: Locale = "lv") {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(iso: string, locale: Locale = "lv") {
  return `${formatDate(iso, locale)} ${formatTime(iso, locale)}`;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(iso: string, now = new Date()) {
  return isSameDay(new Date(iso), now);
}

export function isTomorrow(iso: string, now = new Date()) {
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  return isSameDay(new Date(iso), t);
}

/** Great-circle distance in kilometres. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number, locale: Locale = "lv") {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${formatNumber(km, locale, 1)} km`;
}

export const UNIT_LABELS: Record<Unit, { lv: string; en: string }> = {
  piece: { lv: "gab.", en: "pcs" },
  kg: { lv: "kg", en: "kg" },
  package: { lv: "pakas", en: "packs" },
  portion: { lv: "porcijas", en: "portions" },
  liter: { lv: "l", en: "l" },
};

export function unitLabel(unit: Unit, locale: Locale) {
  return UNIT_LABELS[unit][locale];
}

/**
 * A listing is only sellable while it has stock, is active, and its pickup
 * deadline (and food-safety date) has not passed. Mirrors the rule that the
 * backend would enforce.
 */
export function isListingAvailable(listing: Listing, now = new Date()) {
  if (listing.status !== "active") return false;
  if (listing.quantity <= 0) return false;
  if (new Date(listing.pickupDeadline).getTime() <= now.getTime()) return false;
  if (
    listing.dateLabelType === "use_by" &&
    new Date(listing.bestBeforeDate).getTime() <= now.getTime()
  ) {
    return false;
  }
  return true;
}

/** Derived status used by seller dashboards and the admin panel. */
export function effectiveStatus(listing: Listing, now = new Date()) {
  if (listing.status === "removed" || listing.status === "suspended") return listing.status;
  if (listing.status === "draft") return "draft";
  if (listing.quantity <= 0) return "sold_out";
  if (new Date(listing.pickupDeadline).getTime() <= now.getTime()) return "expired";
  if (
    listing.dateLabelType === "use_by" &&
    new Date(listing.bestBeforeDate).getTime() <= now.getTime()
  ) {
    return "expired";
  }
  return listing.status;
}

export function slugify(input: string) {
  const map: Record<string, string> = {
    ā: "a", č: "c", ē: "e", ģ: "g", ī: "i", ķ: "k", ļ: "l",
    ņ: "n", š: "s", ū: "u", ž: "z",
  };
  return input
    .toLowerCase()
    .replace(/[āčēģīķļņšūž]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Human-friendly order number, e.g. DER-4F92AC. */
export function generateOrderNumber() {
  return `DER-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** 4-digit code the customer shows at pickup. */
export function generatePickupCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function atTime(date: Date, hours: number, minutes = 0) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}
