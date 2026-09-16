"use client";

import { Building2, CheckCircle2, Info, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormMessage, SelectField, TextArea, TextField } from "@/components/ui/Form";
import { CATEGORIES } from "@/lib/data/categories";
import { useI18n } from "@/lib/i18n";
import {
  isValidRegistrationNumberFormat,
  lookupCompany,
} from "@/lib/services/registryLookup";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function BusinessRegistrationPage() {
  const { t } = useI18n();
  const registerBusiness = useDataStore((s) => s.registerBusiness);
  const setUser = useSessionStore((s) => s.setUser);

  const [form, setForm] = useState({
    companyName: "",
    registrationNumber: "",
    vatNumber: "",
    notVatRegistered: false,
    legalAddress: "",
    pickupAddress: "",
    pickupCity: "Rīga",
    sameAsLegal: false,
    responsiblePerson: "",
    email: "",
    phone: "",
    invoiceEmail: "",
    bankName: "",
    iban: "",
    categorySlug: "partikas-veikali",
    description: "",
    password: "",
    passwordConfirm: "",
    acceptTerms: false,
    acceptFoodSafety: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [lookupNote, setLookupNote] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const runLookup = async () => {
    const result = await lookupCompany(form.registrationNumber);
    setLookupNote(result.check.note ?? t("businessReg.registrationLookupDisabled"));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const required = [
      form.companyName,
      form.registrationNumber,
      form.legalAddress,
      form.sameAsLegal ? form.legalAddress : form.pickupAddress,
      form.responsiblePerson,
      form.email,
      form.phone,
      form.invoiceEmail,
      form.password,
    ];
    if (required.some((value) => !value.trim())) {
      setError(t("businessReg.errorRequired"));
      return;
    }
    if (!isValidRegistrationNumberFormat(form.registrationNumber)) {
      setError(t("businessReg.errorRegNumber"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    if (!form.acceptTerms || !form.acceptFoodSafety) {
      setError(t("businessReg.errorTerms"));
      return;
    }

    const result = registerBusiness({
      email: form.email,
      password: form.password,
      companyName: form.companyName,
      registrationNumber: form.registrationNumber,
      vatNumber: form.notVatRegistered ? undefined : form.vatNumber,
      legalAddress: form.legalAddress,
      pickupAddress: form.sameAsLegal ? form.legalAddress : form.pickupAddress,
      pickupCity: form.pickupCity,
      responsiblePerson: form.responsiblePerson,
      phone: form.phone,
      invoiceEmail: form.invoiceEmail,
      bankName: form.bankName,
      iban: form.iban,
      categorySlug: form.categorySlug,
      description: form.description,
    });
    if (!result.ok) {
      setError(t("auth.emailTaken"));
      return;
    }
    setUser(result.user);
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="container-page py-12">
        <div className="mx-auto max-w-lg text-center">
          <CheckCircle2 size={48} className="mx-auto text-brand-600" />
          <h1 className="mt-4 text-2xl font-extrabold text-ink-900">
            {t("businessReg.successTitle")}
          </h1>
          <p className="mt-2 text-sm text-ink-600">{t("businessReg.successText")}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button href="/biznesa-panelis" size="lg">
              {t("businessReg.goToDashboard")}
            </Button>
            <Button href="/cenas" variant="outline" size="lg">
              {t("nav.pricing")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
            <Building2 size={14} /> {t("auth.accountTypeBusiness")}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-ink-900 sm:text-3xl">
            {t("businessReg.title")}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t("businessReg.subtitle")}</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <section className="card space-y-4 p-6">
            <h2 className="text-base font-extrabold text-ink-900">
              {t("businessReg.stepCompany")}
            </h2>
            <TextField
              label={t("businessReg.companyName")}
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder='SIA "Mans Uzņēmums"'
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <TextField
                  label={t("businessReg.registrationNumber")}
                  hint={t("businessReg.registrationNumberHint")}
                  value={form.registrationNumber}
                  onChange={(e) => update("registrationNumber", e.target.value)}
                  inputMode="numeric"
                  required
                />
                <button
                  type="button"
                  onClick={runLookup}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline"
                >
                  <Search size={13} /> {t("businessReg.registrationLookup")}
                </button>
              </div>
              <div>
                <TextField
                  label={t("businessReg.vatNumber")}
                  value={form.vatNumber}
                  onChange={(e) => update("vatNumber", e.target.value)}
                  placeholder="LV40103999001"
                  disabled={form.notVatRegistered}
                />
                <div className="mt-2">
                  <Checkbox
                    label={t("businessReg.vatNotRegistered")}
                    checked={form.notVatRegistered}
                    onChange={(v) => update("notVatRegistered", v)}
                  />
                </div>
              </div>
            </div>
            {lookupNote && (
              <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs text-sky-800">
                <Info size={14} className="mt-0.5 shrink-0" />
                {lookupNote}
              </div>
            )}
            <TextField
              label={t("businessReg.legalAddress")}
              value={form.legalAddress}
              onChange={(e) => update("legalAddress", e.target.value)}
              placeholder="Brīvības iela 1, Rīga, LV-1010"
              required
            />
            <div>
              <TextField
                label={t("businessReg.businessAddress")}
                value={form.sameAsLegal ? form.legalAddress : form.pickupAddress}
                onChange={(e) => update("pickupAddress", e.target.value)}
                disabled={form.sameAsLegal}
                required={!form.sameAsLegal}
              />
              <div className="mt-2">
                <Checkbox
                  label={t("businessReg.sameAsLegal")}
                  checked={form.sameAsLegal}
                  onChange={(v) => update("sameAsLegal", v)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label={t("businessReg.category")}
                value={form.categorySlug}
                onChange={(e) => update("categorySlug", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.emoji} {c.nameLv}
                  </option>
                ))}
              </SelectField>
              <TextField
                label={t("locations.city")}
                value={form.pickupCity}
                onChange={(e) => update("pickupCity", e.target.value)}
              />
            </div>
            <TextArea
              label={t("businessReg.description")}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Ko jūs piedāvāsiet platformā?"
            />
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="text-base font-extrabold text-ink-900">
              {t("businessReg.stepContact")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={t("businessReg.responsiblePerson")}
                value={form.responsiblePerson}
                onChange={(e) => update("responsiblePerson", e.target.value)}
                required
              />
              <TextField
                label={t("businessReg.phone")}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+371 20000000"
                required
              />
              <TextField
                label={t("businessReg.email")}
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
              <TextField
                label={t("businessReg.invoiceEmail")}
                type="email"
                value={form.invoiceEmail}
                onChange={(e) => update("invoiceEmail", e.target.value)}
                required
              />
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="text-base font-extrabold text-ink-900">
              {t("businessReg.stepBilling")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={`${t("businessReg.bankName")} (${t("common.optional")})`}
                value={form.bankName}
                onChange={(e) => update("bankName", e.target.value)}
              />
              <TextField
                label={`${t("businessReg.iban")} (${t("common.optional")})`}
                value={form.iban}
                onChange={(e) => update("iban", e.target.value)}
                placeholder="LV00BANK0000000000000"
              />
              <TextField
                label={t("auth.password")}
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
              <TextField
                label={t("auth.passwordConfirm")}
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => update("passwordConfirm", e.target.value)}
                required
              />
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="text-base font-extrabold text-ink-900">
              {t("businessReg.stepConfirm")}
            </h2>
            <Checkbox
              label={
                <>
                  {t("businessReg.acceptTerms")}{" "}
                  <Link href="/noteikumi" className="font-bold text-brand-700 hover:underline">
                    ({t("footer.terms")})
                  </Link>
                </>
              }
              checked={form.acceptTerms}
              onChange={(v) => update("acceptTerms", v)}
            />
            <Checkbox
              label={t("businessReg.acceptFoodSafety")}
              checked={form.acceptFoodSafety}
              onChange={(v) => update("acceptFoodSafety", v)}
            />
          </section>

          {error && <FormMessage tone="error">{error}</FormMessage>}

          <Button type="submit" size="lg" fullWidth>
            {t("businessReg.submit")}
          </Button>
          <p className="text-center text-sm text-ink-600">
            {t("auth.haveAccount")}{" "}
            <Link href="/ienakt" className="font-bold text-brand-700 hover:underline">
              {t("nav.login")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
