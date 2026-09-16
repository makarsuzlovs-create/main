import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "brand"
  | "clay"
  | "neutral"
  | "amber"
  | "red"
  | "green"
  | "blue"
  | "purple";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  clay: "bg-clay-500 text-white border-clay-500",
  neutral: "bg-sand-100 text-ink-700 border-sand-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  purple: "bg-violet-50 text-violet-700 border-violet-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold leading-none",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-clay-500 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm",
        className,
      )}
    >
      -{percent}%
    </span>
  );
}
