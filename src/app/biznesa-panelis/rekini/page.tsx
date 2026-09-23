"use client";

import { Download, FileText, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Toast } from "@/components/ui/Misc";
import { useSeller, type SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { formatDate, formatPrice } from "@/lib/utils";

export default function InvoicesPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell title={t("dashboard.invoices")}>
      {seller && <InvoiceList seller={seller} />}
    </DashboardShell>
  );
}

function InvoiceList({ seller }: { seller: SellerContext }) {
  const { t, locale } = useI18n();
  const markPaid = useDataStore((s) => s.markInvoicePaid);
  const [toast, setToast] = useState<string | null>(null);

  if (!seller.invoices.length) {
    return (
      <EmptyState
        icon={<FileText size={26} />}
        title={t("invoices.empty")}
        text={t("subscription.paymentNotice")}
        actionLabel={t("dashboard.subscription")}
        actionHref="/biznesa-panelis/abonements"
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-sand-200 bg-white px-4 py-3 text-xs text-ink-600">
        {t("invoices.vidNotice")}
      </p>

      <div className="table-wrap">
        <table className="table-base">
          <thead>
            <tr>
              <th>{t("invoices.number")}</th>
              <th>{t("invoices.issueDate")}</th>
              <th>{t("invoices.period")}</th>
              <th>{t("invoices.total")}</th>
              <th>{t("invoices.status")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {seller.invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="font-bold">{invoice.invoiceNumber}</td>
                <td>{formatDate(invoice.issueDate, locale)}</td>
                <td className="whitespace-nowrap">
                  {formatDate(invoice.periodStart, locale)} – {formatDate(invoice.periodEnd, locale)}
                </td>
                <td className="font-bold">{formatPrice(invoice.total, locale)}</td>
                <td>
                  <Badge tone={invoice.status === "paid" ? "green" : "amber"}>
                    {t(`invoices.statusLabels.${invoice.status}`)}
                  </Badge>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1.5">
                    <Link href={`/biznesa-panelis/rekini/skatit?id=${invoice.id}`} className="chip">
                      <Download size={13} /> {t("invoices.view")}
                    </Link>
                    <button
                      className="chip"
                      onClick={() =>
                        setToast(
                          t("invoices.sentToEmail", { email: invoice.customerInvoiceEmail }),
                        )
                      }
                    >
                      <Mail size={13} /> {t("invoices.sendToEmail")}
                    </button>
                    {invoice.status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => markPaid(invoice.id)}>
                        {t("invoices.markPaid")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
