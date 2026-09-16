"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Misc";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import type { SellerType, VerificationStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const TONES: Record<VerificationStatus, "amber" | "green" | "red" | "neutral"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
  suspended: "neutral",
};

export default function AdminBusinessesPage() {
  const { t, locale } = useI18n();
  const businesses = useDataStore((s) => s.businesses);
  const households = useDataStore((s) => s.households);
  const setVerification = useDataStore((s) => s.setVerification);
  const [tab, setTab] = useState<"business" | "household">("business");

  const rows = useMemo(
    () =>
      tab === "business"
        ? businesses.map((b) => ({
            id: b.id,
            type: "business" as SellerType,
            name: b.companyName,
            regNumber: b.registrationNumber,
            vat: b.vatNumber ?? "—",
            contact: `${b.responsiblePerson} · ${b.phone}`,
            address: b.legalAddress,
            invoiceEmail: b.invoiceEmail,
            status: b.verificationStatus,
            createdAt: b.createdAt,
            registry: b.registryCheck.status,
          }))
        : households.map((h) => ({
            id: h.id,
            type: "household" as SellerType,
            name: h.displayName,
            regNumber: "—",
            vat: "—",
            contact: `${h.fullName} · ${h.phone}`,
            address: h.city,
            invoiceEmail: h.email,
            status: h.verificationStatus,
            createdAt: h.createdAt,
            registry: "not_checked",
          })),
    [tab, businesses, households],
  );

  return (
    <AdminShell title={t("admin.businesses")}>
      <div className="space-y-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "business", label: t("browse.businesses"), count: businesses.length },
            { value: "household", label: t("browse.households"), count: households.length },
          ]}
        />

        <div className="table-wrap">
          <table className="table-base min-w-[900px]">
            <thead>
              <tr>
                <th>{t("businessReg.companyName")}</th>
                <th>{t("invoices.regNr")}</th>
                <th>{t("invoices.vatNr")}</th>
                <th>{t("businessReg.responsiblePerson")}</th>
                <th>{t("company.registryCheck")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <p className="font-bold">{row.name}</p>
                    <p className="text-xs text-ink-600">{row.address}</p>
                    <p className="text-xs text-ink-600">
                      {formatDate(row.createdAt, locale)} · {row.invoiceEmail}
                    </p>
                  </td>
                  <td>{row.regNumber}</td>
                  <td>{row.vat}</td>
                  <td>{row.contact}</td>
                  <td>
                    <Badge tone="neutral">
                      {row.registry === "not_checked"
                        ? t("company.registryNotChecked")
                        : row.registry}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={TONES[row.status]}>
                      {t(`admin.verificationStatus.${row.status}`)}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      {row.status !== "approved" && (
                        <Button
                          size="sm"
                          onClick={() => setVerification(row.type, row.id, "approved")}
                        >
                          {t("admin.approve")}
                        </Button>
                      )}
                      {row.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setVerification(row.type, row.id, "rejected")}
                        >
                          {t("admin.reject")}
                        </Button>
                      )}
                      {row.status !== "suspended" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setVerification(row.type, row.id, "suspended")}
                        >
                          {t("admin.suspend")}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setVerification(row.type, row.id, "approved")}
                        >
                          {t("admin.reinstate")}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
