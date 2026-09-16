"use client";

import { Leaf, PiggyBank, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  const pillars = [
    { icon: <Leaf size={22} />, title: t("about.pillar1"), text: t("about.pillar1Text") },
    { icon: <PiggyBank size={22} />, title: t("about.pillar2"), text: t("about.pillar2Text") },
    { icon: <Store size={22} />, title: t("about.pillar3"), text: t("about.pillar3Text") },
  ];

  return (
    <div>
      <section className="border-b border-sand-200 bg-gradient-to-br from-brand-800 to-brand-600 py-16 text-white">
        <div className="container-page max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">{t("about.title")}</h1>
          <p className="mt-5 text-lg text-brand-50/90">{t("about.lead")}</p>
        </div>
      </section>

      <section className="container-page max-w-3xl py-12">
        <p className="text-base leading-relaxed text-ink-700">{t("about.body1")}</p>
        <p className="mt-4 text-base leading-relaxed text-ink-700">{t("about.body2")}</p>
      </section>

      <section className="container-page pb-4">
        <h2 className="mb-6 text-center text-2xl font-extrabold text-ink-900">
          {t("about.pillarsTitle")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="card p-6">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                {pillar.icon}
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-ink-900">{pillar.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:p-8">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-ink-900">{t("about.safetyTitle")}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
              {t("about.safetyText")}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="rounded-3xl bg-ink-900 px-6 py-10 text-center text-white sm:px-10">
          <h2 className="text-2xl font-extrabold">{t("about.joinTitle")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/75">{t("about.joinText")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/piedavajumi" variant="secondary" size="lg">
              {t("about.forCustomers")}
            </Button>
            <Button
              href="/cenas"
              size="lg"
              className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              {t("about.forSellers")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
