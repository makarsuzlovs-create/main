"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ListingForm } from "@/components/dashboard/ListingForm";
import { EmptyState } from "@/components/ui/Misc";
import { useSeller } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";

export default function EditListingPage({ params }: { params: { id: string } }) {
  const { t } = useI18n();
  const seller = useSeller();
  const listing = seller?.listings.find((l) => l.id === params.id);

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
