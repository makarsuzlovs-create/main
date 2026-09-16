"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Misc";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import type { UserRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const { t, locale } = useI18n();
  const users = useDataStore((s) => s.users);
  const setUserStatus = useDataStore((s) => s.setUserStatus);
  const [role, setRole] = useState<UserRole | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (role !== "all" && u.role !== role) return false;
        if (query && !`${u.fullName} ${u.email}`.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      }),
    [users, role, query],
  );

  return (
    <AdminShell title={t("admin.users")}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={role}
            onChange={(value) => setRole(value as UserRole | "all")}
            tabs={[
              { value: "all", label: t("common.all"), count: users.length },
              { value: "customer", label: t("admin.roles.customer") },
              { value: "business", label: t("admin.roles.business") },
              { value: "household", label: t("admin.roles.household") },
              { value: "admin", label: t("admin.roles.admin") },
            ]}
          />
          <div className="relative ml-auto min-w-[200px]">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/60"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("common.search")}
              className="field h-10 pl-9"
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>{t("auth.fullName")}</th>
                <th>{t("auth.email")}</th>
                <th>{t("admin.userRole")}</th>
                <th>{t("common.date")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td className="font-bold">{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge tone={user.role === "admin" ? "purple" : "neutral"}>
                      {t(`admin.roles.${user.role}`)}
                    </Badge>
                  </td>
                  <td>{formatDate(user.createdAt, locale)}</td>
                  <td>
                    <Badge tone={user.status === "active" ? "green" : "red"}>
                      {user.status === "active"
                        ? t("locations.active")
                        : t("admin.verificationStatus.suspended")}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setUserStatus(user.id, user.status === "active" ? "suspended" : "active")
                      }
                    >
                      {user.status === "active" ? t("admin.suspend") : t("admin.reinstate")}
                    </Button>
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
