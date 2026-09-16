"use client";

import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PlanCard } from "@/components/pricing/PlanCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/Form";
import { Tabs, Toast } from "@/components/ui/Misc";
import { useSeller, type SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import type { BillingInterval } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function SubscriptionPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell title={t("dashboard.subscription")}>
      {seller && <SubscriptionManager seller={seller} />}
    </DashboardShell>
  );
}

function SubscriptionManager({ seller }: { seller: SellerContext }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const plans = useDataStore((s) => s.plans);
  const changePlan = useDataStore((s) => s.changePlan);
  const cancelSubscription = useDataStore((s) => s.cancelSubscription);
  const [interval, setInterval] = useState<BillingInterval>(
    seller.subscription?.interval ?? "monthly",
  );
  const [toast, setToast] = useState<string | null>(null);

  const available = plans.filter(
    (p) => p.isActive && p.availableFor.includes(seller.sellerType),
  );

  const select = (planId: string) => {
    const result = changePlan(seller.sellerType, seller.sellerId, planId, interval);
    setToast(
      result.invoice
        ? `${t("subscription.planChanged")} · ${t("subscription.invoiceGenerated")}`
        : t("subscription.planChanged"),
    );
    if (result.invoice) {
      setTimeout(() => router.push("/biznesa-panelis/rekini"), 1200);
    }
  };

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-600">
              {t("subscription.currentPlan")}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink-900">
              {seller.plan ? (locale === "lv" ? seller.plan.nameLv : seller.plan.nameEn) : "—"}
            </h2>
            {seller.subscription && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-600">
                <Badge
                  tone={
                    seller.subscription.status === "active"
                      ? "green"
                      : seller.subscription.status === "past_due"
                        ? "red"
                        : "neutral"
                  }
                >
                  {t(`subscription.statusLabels.${seller.subscription.status}`)}
                </Badge>
                <span>
                  {t("subscription.renewsOn")}:{" "}
                  {formatDate(seller.subscription.currentPeriodEnd, locale)}
                </span>
                <span>
                  {t("subscription.period")}:{" "}
                  {seller.subscription.interval === "monthly"
                    ? t("subscription.monthly")
                    : t("subscription.annual")}
                </span>
              </div>
            )}
          </div>

          {seller.subscription && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                cancelSubscription(
                  seller.subscription!.id,
                  !seller.subscription!.cancelAtPeriodEnd,
                )
              }
            >
              {seller.subscription.cancelAtPeriodEnd
                ? t("subscription.resume")
                : t("subscription.cancel")}
            </Button>
          )}
        </div>

        {seller.subscription?.cancelAtPeriodEnd && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800">
            {t("subscription.cancelAtPeriodEnd")}
          </p>
        )}
      </section>

      <FormMessage tone="info">
        <span className="flex items-start gap-2">
          <Info size={15} className="mt-0.5 shrink-0" />
          {t("subscription.paymentNotice")}
        </span>
      </FormMessage>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-ink-900">{t("subscription.changePlan")}</h2>
        <Tabs
          value={interval}
          onChange={(value) => setInterval(value as BillingInterval)}
          tabs={[
            { value: "monthly", label: t("subscription.monthly") },
            { value: "annual", label: t("subscription.annual") },
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {available.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            interval={interval}
            current={seller.subscription?.planId === plan.id}
            onSelect={() => select(plan.id)}
            actionLabel={t("subscription.selectPlan")}
          />
        ))}
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
