"use client";

import { ArrowRight, Leaf, PiggyBank, Sparkles, Store, Timer } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { OfferCard } from "@/components/marketplace/OfferCard";
import { Button } from "@/components/ui/Button";
import { CardSkeletonGrid, SectionHeader, Toast } from "@/components/ui/Misc";
import { useHydrated } from "@/components/providers/AppProviders";
import { CATEGORY_VISUALS } from "@/lib/data/categories";
import { useOfferViews } from "@/lib/hooks/useOffers";
import { pick, useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { formatNumber } from "@/lib/utils";

export default function HomePage() {
  const { t, locale } = useI18n();
  const hydrated = useHydrated();
  const offers = useOfferViews();
  const categories = useDataStore((s) => s.categories);
  const impact = useDataStore((s) => s.impact);
  const [toast, setToast] = useState<string | null>(null);

  const nearby = useMemo(
    () => [...offers].sort((a, b) => a.distance - b.distance).slice(0, 8),
    [offers],
  );
  const endingSoon = useMemo(
    () =>
      [...offers]
        .sort(
          (a, b) =>
            new Date(a.listing.pickupWindowEnd).getTime() -
            new Date(b.listing.pickupWindowEnd).getTime(),
        )
        .slice(0, 4),
    [offers],
  );
  const currentImpact = impact[impact.length - 1];

  return (
    <>
      <Hero />

      {/* Categories */}
      <section className="container-page mt-10">
        <SectionHeader title={t("home.categories")} />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-8">
          {(hydrated ? categories.filter((c) => c.isActive) : []).map((category) => {
            const visual = CATEGORY_VISUALS[category.slug];
            return (
              <Link
                key={category.id}
                href={`/piedavajumi?kategorija=${category.slug}`}
                className="card card-hover flex w-28 shrink-0 flex-col items-center gap-2 p-3 text-center sm:w-auto"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${visual?.from ?? "#e8f0ea"}, ${visual?.to ?? "#9bbcab"})`,
                  }}
                  aria-hidden
                >
                  {category.emoji}
                </span>
                <span className="text-xs font-bold leading-tight text-ink-800">
                  {locale === "lv" ? category.nameLv : category.nameEn}
                </span>
              </Link>
            );
          })}
          {!hydrated &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-[104px] w-28 shrink-0 animate-pulse sm:w-auto" />
            ))}
        </div>
      </section>

      {/* Nearby offers */}
      <section className="container-page mt-12">
        <SectionHeader
          title={t("home.nearby")}
          subtitle={t("home.nearbySubtitle")}
          action={
            <Link
              href="/piedavajumi"
              className="hidden items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 sm:inline-flex"
            >
              {t("home.seeAll")} <ArrowRight size={16} />
            </Link>
          }
        />
        {!hydrated ? (
          <CardSkeletonGrid count={8} />
        ) : nearby.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nearby.map((offer) => (
              <OfferCard
                key={offer.listing.id}
                offer={offer}
                onAdd={() => setToast(`${pick(locale, offer.listing.title, offer.listing.titleEn)} → ${t("nav.cart")}`)}
              />
            ))}
          </div>
        ) : (
          <p className="card p-8 text-center text-sm text-ink-600">{t("browse.emptyText")}</p>
        )}
        <div className="mt-5 sm:hidden">
          <Button href="/piedavajumi" variant="outline" fullWidth>
            {t("home.seeAll")}
          </Button>
        </div>
      </section>

      {/* Ending soon */}
      {hydrated && endingSoon.length > 0 && (
        <section className="container-page mt-12">
          <SectionHeader
            title={t("home.endingSoon")}
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-50 px-3 py-1.5 text-xs font-bold text-clay-700">
                <Timer size={14} /> {t("offer.pickupToday")}
              </span>
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {endingSoon.map((offer) => (
              <OfferCard key={offer.listing.id} offer={offer} onAdd={() => setToast(t("nav.cart"))} />
            ))}
          </div>
        </section>
      )}

      {/* Impact strip */}
      <section className="container-page mt-14">
        <div className="rounded-3xl bg-brand-800 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            {t("home.impactStripTitle")}
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <ImpactNumber
              icon={<Leaf size={20} />}
              value={
                currentImpact ? `${formatNumber(currentImpact.savedFoodKg, locale)} kg` : "—"
              }
              label={t("impact.monthlyChart")}
            />
            <ImpactNumber
              icon={<Sparkles size={20} />}
              value={currentImpact ? formatNumber(currentImpact.savedItems, locale) : "—"}
              label={t("impact.yourOrders")}
            />
            <ImpactNumber
              icon={<PiggyBank size={20} />}
              value={currentImpact ? `€${formatNumber(currentImpact.savedMoney, locale)}` : "—"}
              label={t("impact.yourSavings")}
            />
          </div>
          <p className="mt-6 text-xs text-brand-200/80">{t("impact.demoDisclaimer")}</p>
          <div className="mt-6">
            <Button href="/ietekme" variant="outline" size="sm">
              {t("nav.impact")}
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page mt-14">
        <SectionHeader title={t("home.howItWorks")} />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="card p-6">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-sm font-extrabold text-brand-700">
                {step}
              </span>
              <h3 className="mt-4 text-base font-extrabold text-ink-900">
                {t(`home.step${step}Title`)}
              </h3>
              <p className="mt-1.5 text-sm text-ink-600">{t(`home.step${step}Text`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seller CTA */}
      <section className="container-page mt-14">
        <div className="card grid gap-6 overflow-hidden p-6 sm:grid-cols-[1.4fr_1fr] sm:p-10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-50 px-3 py-1.5 text-xs font-bold text-clay-700">
              <Store size={14} /> {t("nav.forSellers")}
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-ink-900 sm:text-3xl">
              {t("home.sellerCtaTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ink-600">{t("home.sellerCtaText")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/registreties/uznemums">{t("home.sellerCtaButton")}</Button>
              <Button href="/registreties/majsaimnieciba" variant="outline">
                {t("home.householdCtaButton")}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-center">
            {["🥐", "🛒", "🍲", "🧁"].map((emoji, i) => (
              <div
                key={emoji}
                className="flex h-24 items-center justify-center rounded-2xl text-4xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${
                    ["#f5d9a8", "#d6f0e6", "#ffd6b0", "#ffd9e6"][i]
                  }, ${["#d99b57", "#3f9c7d", "#e2714b", "#d9749b"][i]})`,
                }}
                aria-hidden
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden border-b border-sand-200 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500">
      <div
        aria-hidden
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-clay-400/20 blur-3xl"
      />
      <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            <Leaf size={14} /> {t("common.demoBadge")}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-base text-brand-50/90 sm:text-lg">
            {t("home.heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/piedavajumi" size="lg" variant="secondary">
              {t("home.heroCta")}
            </Button>
            <Button
              href="/par-mums"
              size="lg"
              className="border border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              {t("home.heroSecondary")}
            </Button>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

/** Decorative preview of an offer card, shown beside the hero copy. */
function HeroPreview() {
  const { t, locale } = useI18n();
  return (
    <div className="relative hidden lg:block" aria-hidden>
      <div className="ml-auto w-[330px] rotate-[-2deg] rounded-3xl bg-white p-3 shadow-lift">
        <div
          className="relative flex h-40 items-center justify-center rounded-2xl text-6xl"
          style={{ backgroundImage: "linear-gradient(135deg,#f5d9a8,#d99b57)" }}
        >
          🥖
          <span className="absolute left-3 top-3 rounded-full bg-clay-500 px-2.5 py-1 text-xs font-extrabold text-white">
            -65%
          </span>
        </div>
        <div className="p-3">
          <p className="text-xs font-semibold text-ink-600">🥖 SIA &quot;Rudzu Rīts&quot;</p>
          <p className="mt-0.5 text-base font-extrabold text-ink-900">
            {locale === "lv" ? "Rīta maiznīcas paka" : "Morning bakery bag"}
          </p>
          <p className="mt-1 text-xs text-ink-600">{t("offer.pickupToday")} 18:00–20:00 · 1,2 km</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-brand-700">3,99 €</span>
            <span className="text-sm text-ink-600 line-through">11,50 €</span>
            <span className="ml-auto text-[11px] font-bold text-clay-600">
              {t("offer.onlyLeft", { count: 4 })}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 left-0 w-56 rotate-[3deg] rounded-2xl bg-white/95 p-4 shadow-lift backdrop-blur">
        <p className="text-2xl font-extrabold text-brand-700">12 450 kg</p>
        <p className="text-xs font-semibold text-ink-600">{t("home.impactStripTitle")}</p>
      </div>
    </div>
  );
}

function ImpactNumber({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-brand-100">
        {icon}
      </span>
      <div>
        <p className="text-2xl font-extrabold text-white sm:text-3xl">{value}</p>
        <p className="text-xs font-semibold text-brand-200">{label}</p>
      </div>
    </div>
  );
}
