import { Suspense } from "react";
import { BrowseView } from "@/components/marketplace/BrowseView";
import { CardSkeletonGrid } from "@/components/ui/Misc";

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="container-page py-8"><CardSkeletonGrid count={6} /></div>}>
      <BrowseView defaultView="list" />
    </Suspense>
  );
}
