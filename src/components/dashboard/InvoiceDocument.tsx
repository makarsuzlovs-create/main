"use client";

import { BILLING_CONFIG, BRAND, PLATFORM_LEGAL_ENTITY } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import type { Invoice } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

/** Printable invoice sheet. Browser print-to-PDF stands in for a PDF service. */
export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const { t, locale } = useI18n();

  return (
    <article className="print-sheet card mx-auto max-w-3xl p-6 sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-sand-200 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-600">
            {t("invoices.title")}
          </p>
          <h1 className="text-2xl font-extrabold text-ink-900">{invoice.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-ink-600">
            {t("invoices.issueDate")}: {formatDate(invoice.issueDate, locale)} ·{" "}
            {t("invoices.dueDate")}: {formatDate(invoice.dueDate, locale)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-brand-700">Derīgs.</p>
          <p className="text-xs text-ink-600">{BRAND.domain}</p>
          <p
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-extrabold ${
              invoice.status === "paid"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {t(`invoices.statusLabels.${invoice.status}`)}
          </p>
        </div>
      </header>

      <div className="grid gap-6 py-6 sm:grid-cols-2">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-600">
            {t("invoices.serviceProvider")}
          </h2>
          <p className="mt-2 text-sm font-extrabold text-ink-900">{PLATFORM_LEGAL_ENTITY.name}</p>
          <p className="text-sm text-ink-700">
            {t("invoices.regNr")}: {PLATFORM_LEGAL_ENTITY.registrationNumber}
          </p>
          <p className="text-sm text-ink-700">
            {t("invoices.vatNr")}: {PLATFORM_LEGAL_ENTITY.vatNumber}
          </p>
          <p className="text-sm text-ink-700">{PLATFORM_LEGAL_ENTITY.legalAddress}</p>
          <p className="mt-2 text-sm text-ink-700">
            {PLATFORM_LEGAL_ENTITY.bank} · {PLATFORM_LEGAL_ENTITY.iban}
          </p>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-600">
            {t("invoices.customer")}
          </h2>
          <p className="mt-2 text-sm font-extrabold text-ink-900">{invoice.customerName}</p>
          {invoice.customerRegistrationNumber && (
            <p className="text-sm text-ink-700">
              {t("invoices.regNr")}: {invoice.customerRegistrationNumber}
            </p>
          )}
          {invoice.customerVatNumber && (
            <p className="text-sm text-ink-700">
              {t("invoices.vatNr")}: {invoice.customerVatNumber}
            </p>
          )}
          <p className="text-sm text-ink-700">{invoice.customerLegalAddress}</p>
          <p className="mt-2 text-sm text-ink-700">{invoice.customerInvoiceEmail}</p>
        </section>
      </div>

      <p className="rounded-xl bg-sand-50 px-4 py-2.5 text-sm text-ink-700">
        {t("invoices.period")}: {formatDate(invoice.periodStart, locale)} –{" "}
        {formatDate(invoice.periodEnd, locale)}
      </p>

      <div className="table-wrap mt-5">
        <table className="table-base">
          <thead>
            <tr>
              <th>{t("invoices.description")}</th>
              <th>{t("invoices.qty")}</th>
              <th>{t("invoices.unitPrice")}</th>
              <th>{t("invoices.vat")}</th>
              <th>{t("invoices.lineTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.unitPrice, locale)}</td>
                <td>{Math.round(item.vatRate * 100)}%</td>
                <td className="font-bold">{formatPrice(item.lineTotal, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex justify-end">
        <dl className="w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-600">{t("invoices.subtotal")}</dt>
            <dd className="font-bold text-ink-900">{formatPrice(invoice.subtotal, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-600">
              {t("invoices.vat")} ({Math.round(invoice.vatRate * 100)}%)
            </dt>
            <dd className="font-bold text-ink-900">{formatPrice(invoice.vatAmount, locale)}</dd>
          </div>
          <div className="flex justify-between border-t border-sand-200 pt-2 text-base">
            <dt className="font-bold text-ink-900">{t("invoices.total")}</dt>
            <dd className="font-extrabold text-brand-700">{formatPrice(invoice.total, locale)}</dd>
          </div>
        </dl>
      </div>

      {invoice.vatRate === 0 && (
        <p className="mt-4 text-xs text-ink-600">
          {locale === "lv"
            ? "PVN netiek piemērots, jo klients nav norādījis PVN numuru."
            : "VAT is not applied because the customer has not provided a VAT number."}
        </p>
      )}

      <footer className="mt-6 border-t border-sand-200 pt-4 text-xs text-ink-600">
        <p>
          {t("invoices.paymentDetails")}: {PLATFORM_LEGAL_ENTITY.bank},{" "}
          {PLATFORM_LEGAL_ENTITY.iban} · {BILLING_CONFIG.invoicePaymentTermDays} d.
        </p>
        <p className="mt-2">{t("invoices.vidNotice")}</p>
      </footer>
    </article>
  );
}
