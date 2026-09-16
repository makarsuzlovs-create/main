"use client";

import { Info, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormMessage, SelectField, TextField, Toggle } from "@/components/ui/Form";
import { Toast } from "@/components/ui/Misc";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import type { PlanLimits, SubscriptionPlan } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

export default function AdminSubscriptionsPage() {
  const { t, locale } = useI18n();
  const plans = useDataStore((s) => s.plans);
  const updatePlans = useDataStore((s) => s.updatePlans);
  const subscriptions = useDataStore((s) => s.subscriptions);
  const businesses = useDataStore((s) => s.businesses);
  const [draft, setDraft] = useState<SubscriptionPlan[]>(plans);
  const [toast, setToast] = useState<string | null>(null);

  // Plans arrive after the mock backend rehydrates from localStorage.
  useEffect(() => setDraft(plans), [plans]);

  const patch = (id: string, changes: Partial<SubscriptionPlan>) =>
    setDraft((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));

  const patchLimits = (id: string, changes: Partial<PlanLimits>) =>
    setDraft((list) =>
      list.map((p) => (p.id === id ? { ...p, limits: { ...p.limits, ...changes } } : p)),
    );

  const parsePrice = (value: string) => (value.trim() === "" ? null : Number(value));
  const parseLimit = (value: string): number | "unlimited" =>
    value.trim() === "" || value === "0" ? "unlimited" : Number(value);

  return (
    <AdminShell title={t("admin.subscriptions")}>
      <div className="space-y-5">
        <section className="card p-5">
          <h2 className="text-base font-extrabold text-ink-900">{t("admin.planPricing")}</h2>
          <p className="mt-1 flex items-start gap-2 text-sm text-ink-600">
            <Info size={15} className="mt-0.5 shrink-0 text-brand-600" />
            {t("admin.planPricingText")}
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {draft.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-sand-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold text-ink-900">
                    {plan.code}{" "}
                    <span className="text-xs font-semibold text-ink-600">
                      ({plan.availableFor.join(", ")})
                    </span>
                  </h3>
                  <Toggle
                    checked={plan.isActive}
                    onChange={(value) => patch(plan.id, { isActive: value })}
                    label={t("admin.planActive")}
                  />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <TextField
                    label={t("admin.monthlyPrice")}
                    type="number"
                    step="0.01"
                    min="0"
                    value={plan.monthlyPrice === null ? "" : String(plan.monthlyPrice)}
                    onChange={(e) => patch(plan.id, { monthlyPrice: parsePrice(e.target.value) })}
                    placeholder="—"
                    hint={plan.monthlyPrice === null ? t("subscription.priceTbdNote") : undefined}
                  />
                  <TextField
                    label={t("admin.annualPrice")}
                    type="number"
                    step="0.01"
                    min="0"
                    value={plan.annualPrice === null ? "" : String(plan.annualPrice)}
                    onChange={(e) => patch(plan.id, { annualPrice: parsePrice(e.target.value) })}
                    placeholder="—"
                  />
                  <TextField
                    label={t("admin.listingLimit")}
                    type="number"
                    min="0"
                    value={
                      plan.limits.activeListings === "unlimited"
                        ? ""
                        : String(plan.limits.activeListings)
                    }
                    onChange={(e) =>
                      patchLimits(plan.id, { activeListings: parseLimit(e.target.value) })
                    }
                    placeholder="∞"
                  />
                  <TextField
                    label={t("admin.locationLimit")}
                    type="number"
                    min="0"
                    value={plan.limits.locations === "unlimited" ? "" : String(plan.limits.locations)}
                    onChange={(e) => patchLimits(plan.id, { locations: parseLimit(e.target.value) })}
                    placeholder="∞"
                  />
                  <SelectField
                    label={t("admin.analyticsLevel")}
                    value={plan.limits.analytics}
                    onChange={(e) =>
                      patchLimits(plan.id, {
                        analytics: e.target.value as PlanLimits["analytics"],
                      })
                    }
                    wrapperClassName="sm:col-span-2"
                  >
                    <option value="basic">basic</option>
                    <option value="advanced">advanced</option>
                    <option value="full">full</option>
                  </SelectField>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button
              onClick={() => {
                updatePlans(draft);
                setToast(t("admin.plansSaved"));
              }}
            >
              <Save size={16} /> {t("admin.savePlans")}
            </Button>
            <Button variant="ghost" onClick={() => setDraft(plans)}>
              {t("common.cancel")}
            </Button>
          </div>
        </section>

        <FormMessage tone="info">{t("pricing.tbdNotice")}</FormMessage>

        <section className="card overflow-hidden">
          <h2 className="border-b border-sand-100 px-5 py-4 text-sm font-extrabold text-ink-900">
            {t("admin.subscriptions")}
          </h2>
          <div className="table-wrap border-0">
            <table className="table-base">
              <thead>
                <tr>
                  <th>{t("businessReg.companyName")}</th>
                  <th>{t("subscription.currentPlan")}</th>
                  <th>{t("subscription.period")}</th>
                  <th>{t("subscription.renewsOn")}</th>
                  <th>{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const business = businesses.find((b) => b.id === sub.sellerId);
                  const plan = plans.find((p) => p.id === sub.planId);
                  const price = sub.interval === "monthly" ? plan?.monthlyPrice : plan?.annualPrice;
                  return (
                    <tr key={sub.id}>
                      <td className="font-bold">{business?.companyName ?? sub.sellerId}</td>
                      <td>
                        {plan?.code ?? "—"}{" "}
                        <span className="text-xs text-ink-600">
                          {price === null || price === undefined
                            ? t("subscription.priceTbd")
                            : formatPrice(price, locale)}
                        </span>
                      </td>
                      <td>
                        {sub.interval === "monthly"
                          ? t("subscription.monthly")
                          : t("subscription.annual")}
                      </td>
                      <td>{formatDate(sub.currentPeriodEnd, locale)}</td>
                      <td>
                        <Badge
                          tone={
                            sub.status === "active"
                              ? "green"
                              : sub.status === "past_due"
                                ? "red"
                                : "neutral"
                          }
                        >
                          {t(`subscription.statusLabels.${sub.status}`)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <Toast message={toast} onClose={() => setToast(null)} />
      </div>
    </AdminShell>
  );
}
