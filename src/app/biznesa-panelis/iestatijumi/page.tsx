"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Form";
import { Toast } from "@/components/ui/Misc";
import { SELLER_RULES } from "@/lib/config";
import { useSeller, type SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";

export default function SellerSettingsPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell title={t("dashboard.settings")}>
      {seller && <Settings seller={seller} />}
    </DashboardShell>
  );
}

function Settings({ seller }: { seller: SellerContext }) {
  const { t } = useI18n();
  const resetDemoData = useDataStore((s) => s.resetDemoData);
  const [notifications, setNotifications] = useState({ orders: true, expiry: true, invoices: true });
  const [toast, setToast] = useState<string | null>(null);
  const rules = SELLER_RULES[seller.sellerType];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="card space-y-4 p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
          {t("profile.account")}
        </h2>
        <dl className="space-y-2 text-sm">
          <Row label={t("auth.email")} value={seller.user.email} />
          <Row label={t("admin.userRole")} value={t(`admin.roles.${seller.user.role}`)} />
          <Row label={t("company.verification")} value={t(`admin.verificationStatus.${seller.verificationStatus}`)} />
        </dl>
        <div className="flex items-center justify-between border-t border-sand-100 pt-4">
          <span className="text-sm font-semibold text-ink-700">{t("profile.language")}</span>
          <LanguageSwitch />
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
          {t("profile.notifications")}
        </h2>
        <Toggle
          checked={notifications.orders}
          onChange={(v) => setNotifications((n) => ({ ...n, orders: v }))}
          label={t("dashboard.orders")}
        />
        <Toggle
          checked={notifications.expiry}
          onChange={(v) => setNotifications((n) => ({ ...n, expiry: v }))}
          label={t("listingForm.pickupDeadline")}
        />
        <Toggle
          checked={notifications.invoices}
          onChange={(v) => setNotifications((n) => ({ ...n, invoices: v }))}
          label={t("dashboard.invoices")}
        />
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
          {seller.sellerType === "business"
            ? t("auth.accountTypeBusiness")
            : t("auth.accountTypeHousehold")}
        </h2>
        <ul className="space-y-1.5 text-sm text-ink-700">
          <li>
            • {t("dashboard.myListings")}:{" "}
            {seller.limits.maxListings ?? "∞"}
          </li>
          <li>
            • {t("dashboard.locations")}: {seller.limits.maxLocations ?? "∞"}
          </li>
          <li>
            • {t("dashboard.subscription")}:{" "}
            {rules.requiresSubscription ? t("common.yes") : t("common.no")}
          </li>
          {rules.monthlyTurnoverCapEur && (
            <li>• {t("householdReg.rule4", { amount: `€${rules.monthlyTurnoverCapEur}` })}</li>
          )}
        </ul>
        <p className="text-xs text-ink-600">{t("householdReg.rulesDisclaimer")}</p>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
          {t("common.demoBadge")}
        </h2>
        <p className="text-sm text-ink-600">{t("common.demoNotice")}</p>
        <Button
          variant="outline"
          onClick={() => {
            resetDemoData();
            setToast(t("common.saved"));
          }}
        >
          {t("common.tryAgain")}
        </Button>
      </section>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-600">{label}</dt>
      <dd className="font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
