"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { TextField, Toggle } from "@/components/ui/Form";
import { Modal, Toast } from "@/components/ui/Misc";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { randomId, slugify } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const { t } = useI18n();
  const categories = useDataStore((s) => s.categories);
  const upsertCategory = useDataStore((s) => s.upsertCategory);
  const listings = useDataStore((s) => s.listings);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ nameLv: "", nameEn: "", emoji: "🍽️" });

  const add = () => {
    if (!form.nameLv.trim()) return;
    upsertCategory({
      id: randomId("cat"),
      slug: slugify(form.nameLv),
      nameLv: form.nameLv,
      nameEn: form.nameEn || form.nameLv,
      emoji: form.emoji || "🍽️",
      isActive: true,
      sortOrder: categories.length + 1,
    });
    setForm({ nameLv: "", nameEn: "", emoji: "🍽️" });
    setOpen(false);
    setToast(t("common.saved"));
  };

  return (
    <AdminShell title={t("admin.categories")}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus size={16} /> {t("admin.addCategory")}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...categories]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((category) => (
              <div key={category.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-xl">
                      {category.emoji}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-ink-900">{category.nameLv}</p>
                      <p className="text-xs text-ink-600">{category.nameEn}</p>
                      <p className="text-[11px] text-ink-600/70">/{category.slug}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink-600">
                    {listings.filter((l) => l.categorySlug === category.slug).length}
                  </span>
                </div>
                <div className="mt-3 space-y-2 border-t border-sand-100 pt-3">
                  <TextField
                    label={t("admin.categoryName")}
                    value={category.nameLv}
                    onChange={(e) => upsertCategory({ ...category, nameLv: e.target.value })}
                  />
                  <TextField
                    label={t("admin.categoryNameEn")}
                    value={category.nameEn}
                    onChange={(e) => upsertCategory({ ...category, nameEn: e.target.value })}
                  />
                  <Toggle
                    checked={category.isActive}
                    onChange={(value) => upsertCategory({ ...category, isActive: value })}
                    label={t("admin.categoryActive")}
                  />
                </div>
              </div>
            ))}
        </div>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={t("admin.addCategory")}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={add}>{t("common.save")}</Button>
            </>
          }
        >
          <div className="space-y-4">
            <TextField
              label={t("admin.categoryName")}
              value={form.nameLv}
              onChange={(e) => setForm((f) => ({ ...f, nameLv: e.target.value }))}
            />
            <TextField
              label={t("admin.categoryNameEn")}
              value={form.nameEn}
              onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
            />
            <TextField
              label="Emoji"
              value={form.emoji}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
            />
          </div>
        </Modal>

        <Toast message={toast} onClose={() => setToast(null)} />
      </div>
    </AdminShell>
  );
}
