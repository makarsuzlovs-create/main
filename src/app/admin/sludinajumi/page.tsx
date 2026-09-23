"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { discountPercent, effectiveStatus, formatDate, formatPrice } from "@/lib/utils";

export default function AdminListingsPage() {
  const { t, locale } = useI18n();
  const listings = useDataStore((s) => s.listings);
  const businesses = useDataStore((s) => s.businesses);
  const households = useDataStore((s) => s.households);
  const setListingStatus = useDataStore((s) => s.setListingStatus);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const now = new Date();
    return listings
      .filter((l) =>
        query ? l.title.toLowerCase().includes(query.toLowerCase()) : true,
      )
      .map((l) => ({
        listing: l,
        status: effectiveStatus(l, now),
        sellerName:
          businesses.find((b) => b.id === l.sellerId)?.companyName ??
          households.find((h) => h.id === l.sellerId)?.displayName ??
          "—",
      }));
  }, [listings, businesses, households, query]);

  return (
    <AdminShell title={t("admin.listings")}>
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/60"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search")}
            className="field h-10 pl-9"
          />
        </div>

        <div className="table-wrap">
          <table className="table-base min-w-[880px]">
            <thead>
              <tr>
                <th>{t("listingForm.name")}</th>
                <th>{t("offer.seller")}</th>
                <th>{t("listingForm.discount")}</th>
                <th>{t("offer.quantity")}</th>
                <th>{t("offer.pickupWindow")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ listing, status, sellerName }) => (
                <tr key={listing.id}>
                  <td>
                    <Link
                      href={`/produkts?id=${listing.id}`}
                      className="font-bold hover:text-brand-700"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-xs text-ink-600">
                      {listing.dateLabelType === "use_by" ? t("offer.useBy") : t("offer.bestBefore")}
                      : {formatDate(listing.bestBeforeDate, locale)}
                    </p>
                  </td>
                  <td>{sellerName}</td>
                  <td>
                    <span className="font-bold text-brand-700">
                      {formatPrice(listing.discountedPrice, locale)}
                    </span>{" "}
                    <span className="text-xs text-ink-600 line-through">
                      {formatPrice(listing.originalPrice, locale)}
                    </span>{" "}
                    <Badge tone="clay">
                      -{discountPercent(listing.originalPrice, listing.discountedPrice)}%
                    </Badge>
                  </td>
                  <td>
                    {listing.quantity}/{listing.quantityInitial}
                  </td>
                  <td>{formatDate(listing.pickupWindowStart, locale)}</td>
                  <td>
                    <Badge
                      tone={
                        status === "active"
                          ? "green"
                          : status === "suspended" || status === "removed"
                            ? "red"
                            : "neutral"
                      }
                    >
                      {status === "active"
                        ? t("dashboard.listingsActive")
                        : status === "sold_out"
                          ? t("offer.soldOut")
                          : status === "suspended"
                            ? t("admin.verificationStatus.suspended")
                            : status === "draft"
                              ? t("listingForm.saveDraft")
                              : t("offer.expired")}
                    </Badge>
                  </td>
                  <td>
                    {status === "suspended" || listing.status === "removed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setListingStatus(listing.id, "active")}
                      >
                        {t("admin.restoreListing")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setListingStatus(listing.id, "suspended")}
                      >
                        {t("admin.suspendListing")}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
