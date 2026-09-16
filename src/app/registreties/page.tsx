"use client";

import { ArrowRight, Home, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { FormMessage, SelectField, TextField } from "@/components/ui/Form";
import { LOCATIONS } from "@/lib/data/cities";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const registerCustomer = useDataStore((s) => s.registerCustomer);
  const setUser = useSessionStore((s) => s.setUser);
  const redirect = useSessionStore((s) => s.redirectAfterLogin);
  const setRedirect = useSessionStore((s) => s.setRedirectAfterLogin);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: LOCATIONS[0].label,
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    const result = registerCustomer({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
      city: form.city,
    });
    if (!result.ok) {
      setError(t("auth.emailTaken"));
      return;
    }
    setUser(result.user);
    const target = redirect ?? "/";
    setRedirect(null);
    router.push(target);
  };

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center text-2xl font-extrabold text-ink-900 sm:text-3xl">
          {t("auth.registerTitle")}
        </h1>
        <p className="mt-1 text-center text-sm text-ink-600">{t("auth.registerSubtitle")}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <TypeCard
            icon={<ShoppingBag size={20} />}
            title={t("auth.accountTypeCustomer")}
            text={t("auth.accountTypeCustomerText")}
            active
          />
          <TypeCard
            icon={<Store size={20} />}
            title={t("auth.accountTypeBusiness")}
            text={t("auth.accountTypeBusinessText")}
            href="/registreties/uznemums"
          />
          <TypeCard
            icon={<Home size={20} />}
            title={t("auth.accountTypeHousehold")}
            text={t("auth.accountTypeHouseholdText")}
            href="/registreties/majsaimnieciba"
          />
        </div>

        <form onSubmit={submit} className="card mt-5 space-y-4 p-6">
          <h2 className="text-base font-extrabold text-ink-900">
            {t("auth.accountTypeCustomer")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={t("auth.fullName")}
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
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
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <Button type="submit" size="lg" fullWidth>
            {t("auth.registerButton")}
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

function TypeCard({
  icon,
  title,
  text,
  href,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href?: string;
  active?: boolean;
}) {
  const content = (
    <div
      className={`card h-full p-5 transition ${
        active ? "border-brand-500 ring-2 ring-brand-100" : "card-hover"
      }`}
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <h3 className="mt-3 text-sm font-extrabold text-ink-900">{title}</h3>
      <p className="mt-1 text-xs text-ink-600">{text}</p>
      {href && (
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-700">
          <ArrowRight size={14} />
        </span>
      )}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
