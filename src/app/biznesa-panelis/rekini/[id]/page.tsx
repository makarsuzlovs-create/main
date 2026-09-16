"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { InvoiceDocument } from "@/components/dashboard/InvoiceDocument";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { useSeller } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { t } = useI18n();
  const seller = useSeller();
  const invoice = seller?.invoices.find((i) => i.id === params.id);

  return (
    <DashboardShell
      title={t("invoices.title")}
      action={
        invoice && (
          <Button size="sm" onClick={() => window.print()} className="no-print">
            <Printer size={15} /> {t("invoices.download")}
          </Button>
        )
      }
    >
      {seller &&
        (invoice ? (
          <div className="space-y-4">
            <Link
              href="/biznesa-panelis/rekini"
              className="no-print inline-flex items-center gap-1.5 text-sm font-bold text-ink-600 hover:text-ink-900"
            >
              <ArrowLeft size={15} /> {t("common.back")}
            </Link>
            <InvoiceDocument invoice={invoice} />
            <p className="no-print mx-auto max-w-3xl text-center text-xs text-ink-600">
              {t("invoices.print")}
            </p>
          </div>
        ) : (
          <EmptyState
            title={t("invoices.empty")}
            actionLabel={t("invoices.title")}
            actionHref="/biznesa-panelis/rekini"
          />
        ))}
    </DashboardShell>
  );
}
