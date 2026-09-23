"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { InvoiceDocument } from "@/components/dashboard/InvoiceDocument";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useSeller } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";

export default function InvoiceDetailPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-96 rounded-3xl" />}>
      <InvoiceDetail />
    </Suspense>
  );
}

function InvoiceDetail() {
  const { t } = useI18n();
  const seller = useSeller();
  const invoiceId = useSearchParams().get("id") ?? "";
  const invoice = seller?.invoices.find((i) => i.id === invoiceId);

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
