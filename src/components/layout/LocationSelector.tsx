"use client";

import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Misc";
import { LOCATIONS } from "@/lib/data/cities";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/store/sessionStore";
import { cn, distanceKm } from "@/lib/utils";

export function LocationSelector({ className, compact }: { className?: string; compact?: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const location = useSessionStore((s) => s.location);
  const setLocation = useSessionStore((s) => s.setLocation);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const nearest = [...LOCATIONS].sort(
          (a, b) => distanceKm(point, a) - distanceKm(point, b),
        )[0];
        setLocation({ ...point, label: nearest.label });
        setLocating(false);
        setOpen(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-w-0 items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-left transition hover:border-brand-300",
          className,
        )}
      >
        <MapPin size={18} className="shrink-0 text-brand-600" />
        <span className="min-w-0">
          {!compact && (
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-600/70">
              {t("home.locationPlaceholder")}
            </span>
          )}
          <span className="block truncate text-sm font-bold text-ink-900">{location.label}</span>
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("home.locationPlaceholder")}>
        <button
          onClick={useMyLocation}
          className="mb-4 flex w-full items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-left transition hover:bg-brand-100"
        >
          <Navigation size={18} className="text-brand-700" />
          <span className="text-sm font-bold text-brand-800">
            {locating ? "…" : "Izmantot manu atrašanās vietu"}
          </span>
        </button>
        <div className="grid gap-1.5">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.label}
              onClick={() => {
                setLocation(loc);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition",
                loc.label === location.label
                  ? "bg-brand-600 text-white"
                  : "text-ink-800 hover:bg-sand-100",
              )}
            >
              {loc.label}
              {loc.label === location.label && <MapPin size={16} />}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
