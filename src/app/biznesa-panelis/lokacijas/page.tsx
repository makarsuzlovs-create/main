"use client";

import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormMessage, TextField, Toggle } from "@/components/ui/Form";
import { EmptyState, Modal } from "@/components/ui/Misc";
import { useSeller, type SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";

export default function SellerLocationsPage() {
  const { t } = useI18n();
  const seller = useSeller();
  return (
    <DashboardShell title={t("dashboard.locations")}>
      {seller && <Locations seller={seller} />}
    </DashboardShell>
  );
}

function Locations({ seller }: { seller: SellerContext }) {
  const { t } = useI18n();
  const addLocation = useDataStore((s) => s.addLocation);
  const updateLocation = useDataStore((s) => s.updateLocation);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "Rīga",
    postalCode: "",
    openingHours: "",
  });
  const [error, setError] = useState<string | null>(null);

  const limitReached =
    seller.limits.maxLocations !== null && seller.locations.length >= seller.limits.maxLocations;

  const submit = () => {
    if (!form.name.trim() || !form.address.trim()) {
      setError(t("businessReg.errorRequired"));
      return;
    }
    addLocation({
      sellerType: seller.sellerType,
      sellerId: seller.sellerId,
      name: form.name,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      openingHours: form.openingHours,
      lat: 56.9496 + (Math.random() - 0.5) * 0.08,
      lng: 24.1052 + (Math.random() - 0.5) * 0.12,
      isActive: true,
    });
    setForm({ name: "", address: "", city: "Rīga", postalCode: "", openingHours: "" });
    setError(null);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-600">
          {seller.locations.length}
          {seller.limits.maxLocations !== null && ` / ${seller.limits.maxLocations}`}
        </p>
        <Button size="sm" onClick={() => setOpen(true)} disabled={limitReached}>
          <Plus size={16} /> {t("locations.add")}
        </Button>
      </div>

      {limitReached && (
        <FormMessage tone="info">
          {t("locations.limitReached", { limit: String(seller.limits.maxLocations) })}
        </FormMessage>
      )}

      {!seller.locations.length ? (
        <EmptyState
          icon={<MapPin size={26} />}
          title={t("locations.empty")}
          actionLabel={t("locations.add")}
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {seller.locations.map((location) => (
            <article key={location.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-extrabold text-ink-900">{location.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-600">
                    <MapPin size={14} className="text-brand-600" />
                    {location.address}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-600">
                    {location.city} {location.postalCode}
                  </p>
                  {location.openingHours && (
                    <p className="mt-1 text-xs text-ink-600">{location.openingHours}</p>
                  )}
                </div>
                <Badge tone={location.isActive ? "green" : "neutral"}>
                  {location.isActive ? t("locations.active") : t("locations.inactive")}
                </Badge>
              </div>
              <div className="mt-4 border-t border-sand-100 pt-3">
                <Toggle
                  checked={location.isActive}
                  onChange={(value) => updateLocation(location.id, { isActive: value })}
                  label={t("locations.active")}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("locations.add")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={submit}>{t("common.save")}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField
            label={t("locations.name")}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <TextField
            label={t("locations.address")}
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={t("locations.city")}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <TextField
              label={t("locations.postalCode")}
              value={form.postalCode}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              placeholder="LV-1010"
            />
          </div>
          <TextField
            label={t("locations.hours")}
            value={form.openingHours}
            onChange={(e) => setForm((f) => ({ ...f, openingHours: e.target.value }))}
            placeholder="P.–Se. 8:00–20:00"
          />
          {error && <FormMessage tone="error">{error}</FormMessage>}
        </div>
      </Modal>
    </div>
  );
}
