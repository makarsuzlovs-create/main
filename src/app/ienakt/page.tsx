"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { FormMessage, TextField } from "@/components/ui/Form";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";

const DEMO_ACCOUNTS = [
  { key: "customerAccount", email: "pircejs@demo.lv", password: "demo1234" },
  { key: "businessAccount", email: "maiznica@demo.lv", password: "demo1234" },
  { key: "householdAccount", email: "majsaimnieciba@demo.lv", password: "demo1234" },
  { key: "adminAccount", email: "admin@demo.lv", password: "demo1234" },
];

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const authenticate = useDataStore((s) => s.authenticate);
  const setUser = useSessionStore((s) => s.setUser);
  const redirect = useSessionStore((s) => s.redirectAfterLogin);
  const setRedirect = useSessionStore((s) => s.setRedirectAfterLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signIn = (loginEmail: string, loginPassword: string) => {
    const session = authenticate(loginEmail, loginPassword);
    if (!session) {
      setError(t("auth.invalidCredentials"));
      return;
    }
    setUser(session);
    const target =
      redirect ??
      (session.role === "admin"
        ? "/admin"
        : session.role === "business" || session.role === "household"
          ? "/biznesa-panelis"
          : "/");
    setRedirect(null);
    router.push(target);
  };

  return (
    <div className="container-page flex justify-center py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-extrabold text-ink-900">{t("auth.loginTitle")}</h1>
          <p className="mt-1 text-sm text-ink-600">{t("auth.loginSubtitle")}</p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              signIn(email, password);
            }}
          >
            <TextField
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vards@epasts.lv"
              required
            />
            <TextField
              label={t("auth.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <FormMessage tone="error">{error}</FormMessage>}
            <Button type="submit" fullWidth size="lg">
              <LogIn size={17} /> {t("auth.loginButton")}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-600">
            {t("auth.noAccount")}{" "}
            <Link href="/registreties" className="font-bold text-brand-700 hover:underline">
              {t("nav.register")}
            </Link>
          </p>
        </div>

        <div className="card mt-4 p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
            {t("auth.demoAccounts")}
          </h2>
          <p className="mt-1 text-xs text-ink-600">{t("auth.demoAccountsText")}</p>
          <ul className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <li
                key={account.email}
                className="flex items-center justify-between gap-3 rounded-xl border border-sand-200 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink-900">{t(`auth.${account.key}`)}</p>
                  <p className="truncate text-xs text-ink-600">
                    {account.email} · {account.password}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    signIn(account.email, account.password);
                  }}
                >
                  {t("auth.useAccount")}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
