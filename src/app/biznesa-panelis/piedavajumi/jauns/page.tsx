"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ListingForm } from "@/components/dashboard/ListingForm";
import { EmptyState } from "@/components/ui/Misc";
import { useSeller } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";

export default function NewListingPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell title={t("listingForm.titleNew")}>
      {seller &&
        (seller.locations.length ? (
          <ListingForm seller={seller} />
        ) : (
          <EmptyState
            title={t("locations.empty")}
            text={t("locations.title")}
            actionLabel={t("locations.add")}
            actionHref="/biznesa-panelis/lokacijas"
          />
        ))}
    </DashboardShell>
  );
}
