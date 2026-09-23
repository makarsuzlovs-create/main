"use client";

import { Flag } from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { formatDate } from "@/lib/utils";

export default function AdminReportsPage() {
  const { t, locale } = useI18n();
  const reports = useDataStore((s) => s.reports);
  const setReportStatus = useDataStore((s) => s.setReportStatus);
  const setListingStatus = useDataStore((s) => s.setListingStatus);
  const setVerification = useDataStore((s) => s.setVerification);

  return (
    <AdminShell title={t("admin.reports")}>
      {reports.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {reports.map((report) => (
            <article key={report.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-600">
                    {report.targetType}
                  </p>
                  {report.targetType === "listing" ? (
                    <Link
                      href={`/produkts?id=${report.targetId}`}
                      className="text-sm font-extrabold text-ink-900 hover:text-brand-700"
                    >
                      {report.targetLabel}
                    </Link>
                  ) : (
                    <p className="text-sm font-extrabold text-ink-900">{report.targetLabel}</p>
                  )}
                  <p className="mt-1 text-sm text-ink-700">{report.reason}</p>
                  <p className="mt-1 text-xs text-ink-600">{formatDate(report.createdAt, locale)}</p>
                </div>
                <Badge
                  tone={
                    report.status === "open"
                      ? "red"
                      : report.status === "reviewing"
                        ? "amber"
                        : "neutral"
                  }
                >
                  {t(`admin.reportStatus.${report.status}`)}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-sand-100 pt-3">
                <Button
                  size="sm"
                  onClick={() => setReportStatus(report.id, "resolved")}
                  variant="outline"
                >
                  {t("admin.resolveReport")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReportStatus(report.id, "dismissed")}
                >
                  {t("admin.dismissReport")}
                </Button>
                {report.targetType === "listing" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setListingStatus(report.targetId, "suspended");
                      setReportStatus(report.id, "resolved");
                    }}
                  >
                    {t("admin.suspendListing")}
                  </Button>
                )}
                {report.targetType === "business" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setVerification("business", report.targetId, "suspended");
                      setReportStatus(report.id, "resolved");
                    }}
                  >
                    {t("admin.suspend")}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Flag size={26} />} title={t("common.noResults")} />
      )}
    </AdminShell>
  );
}
