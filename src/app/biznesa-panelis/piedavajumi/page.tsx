"use client";

import { Package, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FoodImage } from "@/components/ui/FoodImage";
import { EmptyState, Tabs } from "@/components/ui/Misc";
import { useSeller, type SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import type { Listing } from "@/lib/types";
import { discountPercent, effectiveStatus, formatDate, formatPrice, formatTime } from "@/lib/utils";

type Tab = "active" | "sold_out" | "expired" | "all";

export default function SellerListingsPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell
      title={t("dashboard.myListings")}
      action={
        <Button href="/biznesa-panelis/piedavajumi/jauns" size="sm">
          <PlusCircle size={16} /> {t("dashboard.addListing")}
        </Button>
      }
    >
      {seller && <ListingsManager seller={seller} />}
    </DashboardShell>
  );
}

function ListingsManager({ seller }: { seller: SellerContext }) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<Tab>("active");
  const setListingStatus = useDataStore((s) => s.setListingStatus);
  const removeListing = useDataStore((s) => s.removeListing);

  const grouped = useMemo(() => {
    const now = new Date();
    const withStatus = seller.listings.map((l) => ({
      listing: l,
      status: effectiveStatus(l, now),
    }));
    return {
      all: withStatus,
      active: withStatus.filter((l) => l.status === "active" || l.status === "draft"),
      sold_out: withStatus.filter((l) => l.status === "sold_out"),
      expired: withStatus.filter((l) => l.status === "expired" || l.status === "suspended"),
    };
  }, [seller.listings]);

  const list = grouped[tab];

  return (
    <div className="space-y-5">
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "active", label: t("dashboard.listingsActive"), count: grouped.active.length },
          {
            value: "sold_out",
            label: t("dashboard.listingsSoldOut"),
            count: grouped.sold_out.length,
          },
          {
            value: "expired",
            label: t("dashboard.listingsExpired"),
            count: grouped.expired.length,
          },
          { value: "all", label: t("dashboard.listingsAll"), count: grouped.all.length },
        ]}
      />

      {!list.length ? (
        <EmptyState
          icon={<Package size={26} />}
          title={t("dashboard.noListings")}
          actionLabel={t("dashboard.createFirst")}
          actionHref="/biznesa-panelis/piedavajumi/jauns"
        />
      ) : (
        <div className="grid gap-3">
          {list.map(({ listing, status }) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              status={status}
              locale={locale}
              onSoldOut={() => setListingStatus(listing.id, "sold_out")}
              onReactivate={() => setListingStatus(listing.id, "active")}
              onRemove={() => {
                if (window.confirm(t("dashboard.confirmRemove"))) removeListing(listing.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingRow({
  listing,
  status,
  locale,
  onSoldOut,
  onReactivate,
  onRemove,
}: {
  listing: Listing;
  status: string;
  locale: "lv" | "en";
  onSoldOut: () => void;
  onReactivate: () => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const tone =
    status === "active" ? "green" : status === "sold_out" ? "amber" : status === "draft" ? "blue" : "neutral";

  return (
    <article className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <FoodImage categorySlug={listing.categorySlug} alt={listing.title} emojiClassName="text-3xl" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-extrabold text-ink-900">{listing.title}</h3>
          <Badge tone={tone as "green"}>
            {status === "active"
              ? t("dashboard.listingsActive")
              : status === "sold_out"
                ? t("offer.soldOut")
                : status === "draft"
                  ? t("listingForm.saveDraft")
                  : status === "suspended"
                    ? t("admin.verificationStatus.suspended")
                    : t("offer.expired")}
          </Badge>
          {listing.dateLabelType === "use_by" && (
            <Badge tone="amber">
              {t("offer.useBy")}: {formatDate(listing.bestBeforeDate, locale)}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-600">
          {formatDate(listing.pickupWindowStart, locale)}{" "}
          {formatTime(listing.pickupWindowStart, locale)}–
          {formatTime(listing.pickupWindowEnd, locale)} ·{" "}
          {t("offer.remaining")}: {listing.quantity}/{listing.quantityInitial}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-extrabold text-brand-700">
            {formatPrice(listing.discountedPrice, locale)}
          </span>
          <span className="text-xs text-ink-600 line-through">
            {formatPrice(listing.originalPrice, locale)}
          </span>
          <span className="rounded-full bg-clay-500 px-2 py-0.5 text-[11px] font-extrabold text-white">
            -{discountPercent(listing.originalPrice, listing.discountedPrice)}%
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/biznesa-panelis/piedavajumi/rediget?id=${listing.id}`}
          className="chip"
        >
          {t("common.edit")}
        </Link>
        {status === "active" ? (
          <button onClick={onSoldOut} className="chip">
            {t("dashboard.markSoldOut")}
          </button>
        ) : status === "sold_out" || status === "draft" ? (
          <button onClick={onReactivate} className="chip">
            {t("dashboard.reactivate")}
          </button>
        ) : null}
        <button
          onClick={onRemove}
          className="chip border-red-200 text-red-600 hover:border-red-300 hover:text-red-700"
        >
          {t("dashboard.removeListing")}
        </button>
      </div>
    </article>
  );
}
