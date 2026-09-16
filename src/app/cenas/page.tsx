"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { PlanCard } from "@/components/pricing/PlanCard";
import { Button } from "@/components/ui/Button";
import { CardSkeletonGrid, Tabs } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import type { BillingInterval } from "@/lib/types";

export default function PricingPage() {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const plans = useDataStore((s) => s.plans);
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const businessPlans = plans.filter((p) => p.isActive && p.availableFor.includes("business"));
  const householdPlans = plans.filter((p) => p.isActive && p.availableFor.includes("household"));

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">{t("pricing.title")}</h1>
        <p className="mt-3 text-base text-ink-600">{t("pricing.subtitle")}</p>
      </div>

      <div className="mt-6 flex justify-center">
        <Tabs
          value={interval}
          onChange={(value) => setInterval(value as BillingInterval)}
          tabs={[
            { value: "monthly", label: t("pricing.monthly") },
            { value: "annual", label: t("pricing.annual") },
          ]}
        />
      </div>

      <div className="mx-auto mt-4 flex max-w-2xl items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        {t("pricing.tbdNotice")}
      </div>

      {!hydrated ? (
        <div className="mt-8">
          <CardSkeletonGrid count={3} />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {businessPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={interval}
                onSelect={() => {
                  window.location.href = "/registreties/uznemums";
                }}
              />
            ))}
          </div>

          {householdPlans.length > 0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {householdPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  interval={interval}
                  onSelect={() => {
                    window.location.href = "/registreties/majsaimnieciba";
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      <section className="mx-auto mt-14 max-w-3xl">
        <h2 className="text-center text-2xl font-extrabold text-ink-900">{t("pricing.faqTitle")}</h2>
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <details key={n} className="card group p-5">
              <summary className="cursor-pointer list-none text-sm font-extrabold text-ink-900">
                {t(`pricing.faq${n}Q`)}
              </summary>
              <p className="mt-2 text-sm text-ink-600">{t(`pricing.faq${n}A`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-brand-800 px-6 py-10 text-center text-white sm:px-10">
        <h2 className="text-2xl font-extrabold">{t("home.sellerCtaTitle")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-brand-100">{t("home.sellerCtaText")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/registreties/uznemums" variant="secondary" size="lg">
            {t("home.sellerCtaButton")}
          </Button>
          <Button
            href="/registreties/majsaimnieciba"
            size="lg"
            className="border border-white/40 bg-white/10 text-white hover:bg-white/20"
          >
            {t("home.householdCtaButton")}
          </Button>
        </div>
      </section>
    </div>
  );
}
