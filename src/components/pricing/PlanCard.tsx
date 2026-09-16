"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import type { BillingInterval, SubscriptionPlan } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

export function PlanPrice({
  plan,
  interval,
}: {
  plan: SubscriptionPlan;
  interval: BillingInterval;
}) {
  const { t, locale } = useI18n();
  const price = interval === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  const suffix = interval === "monthly" ? t("subscription.perMonth") : t("subscription.perYear");

  if (price === null) {
    return (
      <div>
        <p className="text-3xl font-extrabold text-ink-900">
          {t("subscription.priceTbd")}{" "}
          <span className="text-sm font-semibold text-ink-600">{suffix}</span>
        </p>
        <p className="mt-1 text-xs font-semibold text-clay-600">{t("subscription.priceTbdNote")}</p>
      </div>
    );
  }

  return (
    <p className="text-3xl font-extrabold text-ink-900">
      {price === 0 ? "€0" : formatPrice(price, locale)}{" "}
      <span className="text-sm font-semibold text-ink-600">{suffix}</span>
    </p>
  );
}

export function PlanCard({
  plan,
  interval,
  current,
  onSelect,
  actionLabel,
}: {
  plan: SubscriptionPlan;
  interval: BillingInterval;
  current?: boolean;
  onSelect?: () => void;
  actionLabel?: string;
}) {
  const { t, locale } = useI18n();
  const features = locale === "lv" ? plan.featuresLv : plan.featuresEn;

  return (
    <div
      className={cn(
        "card relative flex h-full flex-col p-6",
        plan.isHighlighted && "border-brand-500 ring-2 ring-brand-100",
        current && "border-brand-600 ring-2 ring-brand-200",
      )}
    >
      {plan.isHighlighted && !current && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-extrabold text-white">
          <Sparkles size={12} /> {plan.code}
        </span>
      )}
      {current && (
        <span className="absolute -top-3 left-6 rounded-full bg-ink-900 px-3 py-1 text-[11px] font-extrabold text-white">
          {t("subscription.currentlySelected")}
        </span>
      )}

      <h3 className="text-lg font-extrabold text-ink-900">
        {locale === "lv" ? plan.nameLv : plan.nameEn}
      </h3>
      <p className="mt-1 min-h-[40px] text-sm text-ink-600">
        {locale === "lv" ? plan.descriptionLv : plan.descriptionEn}
      </p>

      <div className="mt-4 border-y border-sand-100 py-4">
        <PlanPrice plan={plan} interval={interval} />
      </div>

      <ul className="mt-4 flex-1 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-ink-700">
            <Check size={16} className="mt-0.5 shrink-0 text-brand-600" />
            {feature}
          </li>
        ))}
      </ul>

      {onSelect && (
        <div className="mt-5">
          <Button
            fullWidth
            variant={current ? "outline" : plan.isHighlighted ? "primary" : "outline"}
            onClick={onSelect}
            disabled={current}
          >
            {current ? t("subscription.currentlySelected") : (actionLabel ?? t("pricing.choosePlan"))}
          </Button>
        </div>
      )}
    </div>
  );
}
