"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { InvoiceDocument } from "@/components/dashboard/InvoiceDocument";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Misc";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { formatDate, formatPrice } from "@/lib/utils";

export default function AdminInvoicesPage() {
  const { t, locale } = useI18n();
  const invoices = useDataStore((s) => s.invoices);
  const markPaid = useDataStore((s) => s.markInvoicePaid);
  const [openId, setOpenId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...invoices].sort(
        (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
      ),
    [invoices],
  );
  const open = sorted.find((i) => i.id === openId);

  const unpaidTotal = sorted
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <AdminShell title={t("admin.invoices")}>
      <div className="space-y-4">
        <div className="card flex flex-wrap items-center gap-6 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-600">
              {t("invoices.title")}
            </p>
            <p className="text-2xl font-extrabold text-ink-900">{sorted.length}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-600">
              {t("invoices.statusLabels.unpaid")}
            </p>
            <p className="text-2xl font-extrabold text-clay-600">
              {formatPrice(unpaidTotal, locale)}
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table-base min-w-[820px]">
            <thead>
              <tr>
                <th>{t("invoices.number")}</th>
                <th>{t("invoices.customer")}</th>
                <th>{t("invoices.regNr")}</th>
                <th>{t("invoices.issueDate")}</th>
                <th>{t("invoices.total")}</th>
                <th>{t("invoices.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 60).map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-bold">{invoice.invoiceNumber}</td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.customerRegistrationNumber ?? "—"}</td>
                  <td>{formatDate(invoice.issueDate, locale)}</td>
                  <td className="font-bold">{formatPrice(invoice.total, locale)}</td>
                  <td>
                    <Badge tone={invoice.status === "paid" ? "green" : "amber"}>
                      {t(`invoices.statusLabels.${invoice.status}`)}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setOpenId(invoice.id)}>
                        {t("invoices.view")}
                      </Button>
                      {invoice.status !== "paid" && (
                        <Button size="sm" variant="ghost" onClick={() => markPaid(invoice.id)}>
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

        <Modal
          open={Boolean(open)}
          onClose={() => setOpenId(null)}
          title={open?.invoiceNumber ?? ""}
          wide
          footer={
            <Button variant="outline" onClick={() => window.print()}>
              {t("invoices.print")}
            </Button>
          }
        >
          {open && <InvoiceDocument invoice={open} />}
        </Modal>
      </div>
    </AdminShell>
  );
}
