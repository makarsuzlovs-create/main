import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function KpiCard({
  icon,
  label,
  value,
  sublabel,
  tone = "brand",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  tone?: "brand" | "clay" | "sky" | "violet" | "amber";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    clay: "bg-clay-50 text-clay-600",
    sky: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  } as const;
  return (
    <div className="card p-4">
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl",
          tones[tone],
        )}
      >
        {icon}
      </span>
      <p className="mt-3 text-2xl font-extrabold leading-tight text-ink-900">{value}</p>
      <p className="text-xs font-semibold text-ink-600">{label}</p>
      {sublabel && <p className="mt-0.5 text-[11px] text-ink-600/80">{sublabel}</p>}
    </div>
  );
}
