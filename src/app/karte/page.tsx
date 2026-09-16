import { Suspense } from "react";
import { BrowseView } from "@/components/marketplace/BrowseView";
import { Skeleton } from "@/components/ui/Misc";

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-8">
          <Skeleton className="h-[620px] w-full rounded-3xl" />
        </div>
      }
    >
      <BrowseView defaultView="map" />
    </Suspense>
  );
}
