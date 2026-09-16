"use client";

import { CheckCircle2, Home, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormMessage, SelectField, TextField } from "@/components/ui/Form";
import { SELLER_RULES } from "@/lib/config";
import { LOCATIONS } from "@/lib/data/cities";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function HouseholdRegistrationPage() {
  const { t } = useI18n();
  const registerHousehold = useDataStore((s) => s.registerHousehold);
  const setUser = useSessionStore((s) => s.setUser);
  const rules = SELLER_RULES.household;

  const [form, setForm] = useState({
    fullName: "",
    displayName: "",
    email: "",
    phone: "",
    city: LOCATIONS[0].label,
    address: "",
    password: "",
    passwordConfirm: "",
    acceptRules: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (
      !form.fullName.trim() ||
      !form.displayName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.address.trim()
    ) {
      setError(t("businessReg.errorRequired"));
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
    if (!form.acceptRules) {
      setError(t("businessReg.errorTerms"));
      return;
    }
    const result = registerHousehold({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      displayName: form.displayName,
      phone: form.phone,
      city: form.city,
      address: form.address,
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
            {t("householdReg.successTitle")}
          </h1>
          <p className="mt-2 text-sm text-ink-600">{t("householdReg.successText")}</p>
          <div className="mt-6 flex justify-center">
            <Button href="/biznesa-panelis" size="lg">
              {t("businessReg.goToDashboard")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-50 px-3 py-1.5 text-xs font-bold text-clay-700">
            <Home size={14} /> {t("auth.accountTypeHousehold")}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-ink-900 sm:text-3xl">
            {t("householdReg.title")}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t("householdReg.subtitle")}</p>
        </div>

        <section className="card mb-5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink-900">
            <Info size={15} className="text-brand-600" /> {t("householdReg.rulesTitle")}
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
            <li>• {t("householdReg.rule1", { count: rules.maxActiveListings ?? "—" })}</li>
            <li>• {t("householdReg.rule2")}</li>
            <li>• {t("householdReg.rule3")}</li>
            <li>
              •{" "}
              {t("householdReg.rule4", {
                amount: rules.monthlyTurnoverCapEur ? `€${rules.monthlyTurnoverCapEur}` : "—",
              })}
            </li>
          </ul>
          <p className="mt-3 text-xs text-ink-600">{t("householdReg.rulesDisclaimer")}</p>
        </section>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={t("auth.fullName")}
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              required
            />
            <TextField
              label={t("householdReg.displayName")}
              value={form.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              placeholder="Ilzes virtuve"
              required
            />
            <TextField
              label={t("auth.email")}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
            <TextField
              label={t("auth.phone")}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+371 20000000"
              required
            />
            <SelectField
              label={t("auth.city")}
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            >
              {LOCATIONS.map((l) => (
                <option key={l.label}>{l.label}</option>
              ))}
            </SelectField>
            <TextField
              label={t("locations.address")}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Brīvības gatve 214, Rīga"
              required
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

          <Checkbox
            label={t("householdReg.acceptRules")}
            checked={form.acceptRules}
            onChange={(v) => update("acceptRules", v)}
          />

          {error && <FormMessage tone="error">{error}</FormMessage>}

          <Button type="submit" size="lg" fullWidth>
            {t("householdReg.submit")}
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
