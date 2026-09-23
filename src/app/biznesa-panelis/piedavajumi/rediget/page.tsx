"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ListingForm } from "@/components/dashboard/ListingForm";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useSeller } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";

export default function EditListingPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-96 rounded-3xl" />}>
      <EditListing />
    </Suspense>
  );
}

function EditListing() {
  const { t } = useI18n();
  const seller = useSeller();
  const listingId = useSearchParams().get("id") ?? "";
  const listing = seller?.listings.find((l) => l.id === listingId);

  return (
    <DashboardShell title={t("listingForm.titleEdit")}>
      {seller &&
        (listing ? (
          <ListingForm seller={seller} listing={listing} />
        ) : (
          <EmptyState
            title={t("dashboard.noListings")}
            actionLabel={t("dashboard.myListings")}
            actionHref="/biznesa-panelis/piedavajumi"
          />
        ))}
    </DashboardShell>
  );
}
