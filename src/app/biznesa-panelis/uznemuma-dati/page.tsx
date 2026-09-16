"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormMessage, TextArea, TextField } from "@/components/ui/Form";
import { useSeller, type SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";

export default function CompanyDataPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell title={t("company.title")}>
      {seller && <CompanyForm seller={seller} />}
    </DashboardShell>
  );
}

function CompanyForm({ seller }: { seller: SellerContext }) {
  const { t } = useI18n();
  const updateBusiness = useDataStore((s) => s.updateBusiness);
  const updateHousehold = useDataStore((s) => s.updateHousehold);
  const business = seller.business;
  const household = seller.household;

  const [form, setForm] = useState({
    companyName: business?.companyName ?? household?.displayName ?? "",
    registrationNumber: business?.registrationNumber ?? "",
    vatNumber: business?.vatNumber ?? "",
    legalAddress: business?.legalAddress ?? "",
    responsiblePerson: business?.responsiblePerson ?? household?.fullName ?? "",
    email: business?.email ?? household?.email ?? "",
    phone: business?.phone ?? household?.phone ?? "",
    invoiceEmail: business?.invoiceEmail ?? "",
    bankName: business?.bankName ?? "",
    iban: business?.iban ?? "",
    description: business?.description ?? "",
  });
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (business) {
      updateBusiness(business.id, {
        companyName: form.companyName,
        registrationNumber: form.registrationNumber,
        vatNumber: form.vatNumber || undefined,
        legalAddress: form.legalAddress,
        responsiblePerson: form.responsiblePerson,
        email: form.email,
        phone: form.phone,
        invoiceEmail: form.invoiceEmail,
        bankName: form.bankName,
        iban: form.iban,
        description: form.description,
      });
    } else if (household) {
      updateHousehold(household.id, {
        displayName: form.companyName,
        fullName: form.responsiblePerson,
        email: form.email,
        phone: form.phone,
      });
    }
    setSaved(true);
  };

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        <section className="card space-y-4 p-5">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
              {t("company.publicProfile")}
            </h2>
            <p className="text-xs text-ink-600">{t("company.subtitle")}</p>
          </div>
          <TextField
            label={business ? t("businessReg.companyName") : t("householdReg.displayName")}
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
          />
          {business && (
            <TextArea
              label={t("businessReg.description")}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={t("businessReg.responsiblePerson")}
              value={form.responsiblePerson}
              onChange={(e) => update("responsiblePerson", e.target.value)}
            />
            <TextField
              label={t("businessReg.phone")}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <TextField
              label={t("businessReg.email")}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </section>

        {business && (
          <section className="card space-y-4 p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
              {t("company.billingDetails")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={t("businessReg.registrationNumber")}
                value={form.registrationNumber}
                onChange={(e) => update("registrationNumber", e.target.value)}
              />
              <TextField
                label={t("businessReg.vatNumber")}
                value={form.vatNumber}
                onChange={(e) => update("vatNumber", e.target.value)}
                placeholder="LV40103999001"
              />
              <TextField
                label={t("businessReg.legalAddress")}
                value={form.legalAddress}
                onChange={(e) => update("legalAddress", e.target.value)}
                wrapperClassName="sm:col-span-2"
              />
              <TextField
                label={t("businessReg.invoiceEmail")}
                type="email"
                value={form.invoiceEmail}
                onChange={(e) => update("invoiceEmail", e.target.value)}
              />
              <TextField
                label={t("businessReg.bankName")}
                value={form.bankName}
                onChange={(e) => update("bankName", e.target.value)}
              />
              <TextField
                label={t("businessReg.iban")}
                value={form.iban}
                onChange={(e) => update("iban", e.target.value)}
                wrapperClassName="sm:col-span-2"
              />
            </div>
          </section>
        )}

        {saved && <FormMessage tone="success">{t("company.savedMessage")}</FormMessage>}

        <Button type="submit" size="lg">
          {t("company.saveChanges")}
        </Button>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:h-max">
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
            <ShieldCheck size={16} className="text-brand-600" /> {t("company.verification")}
          </h2>
          <div className="mt-3">
            <Badge
              tone={
                seller.verificationStatus === "approved"
                  ? "green"
                  : seller.verificationStatus === "pending"
                    ? "amber"
                    : "red"
              }
            >
              {t(`admin.verificationStatus.${seller.verificationStatus}`)}
            </Badge>
          </div>
          <div className="mt-4 border-t border-sand-100 pt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-600">
              {t("company.registryCheck")}
            </p>
            <p className="mt-1 text-sm text-ink-700">
              {business?.registryCheck.status === "not_checked"
                ? t("company.registryNotChecked")
                : (business?.registryCheck.status ?? t("company.registryNotChecked"))}
            </p>
            {business?.registryCheck.note && (
              <p className="mt-1 text-xs text-ink-600">{business.registryCheck.note}</p>
            )}
          </div>
        </section>
      </aside>
    </form>
  );
}
