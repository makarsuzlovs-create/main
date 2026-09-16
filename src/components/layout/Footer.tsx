"use client";

import Link from "next/link";
import { LogoMark } from "@/components/layout/Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const year = 2026;
  return (
    <footer className="mt-16 border-t border-sand-200 bg-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-extrabold text-ink-900">Derīgs.</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-600">{t("common.demoNotice")}</p>
        </div>

        <FooterColumn
          title={t("footer.product")}
          links={[
            { href: "/piedavajumi", label: t("nav.browse") },
            { href: "/karte", label: t("nav.map") },
            { href: "/ietekme", label: t("nav.impact") },
            { href: "/par-mums", label: t("nav.about") },
          ]}
        />
        <FooterColumn
          title={t("footer.company")}
          links={[
            { href: "/cenas", label: t("nav.pricing") },
            { href: "/registreties/uznemums", label: t("businessReg.title") },
            { href: "/registreties/majsaimnieciba", label: t("householdReg.title") },
          ]}
        />
        <FooterColumn
          title={t("footer.legal")}
          links={[
            { href: "/noteikumi", label: t("footer.terms") },
            { href: "/noteikumi#privatums", label: t("footer.privacy") },
            { href: "/noteikumi#partikas-drosiba", label: t("footer.foodSafety") },
          ]}
        />
      </div>
      <div className="border-t border-sand-100">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} Derīgs — {t("footer.rights")}
          </span>
          <span>{t("footer.madeIn")} 🇱🇻</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-ink-900">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="text-sm text-ink-600 transition hover:text-brand-700">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
