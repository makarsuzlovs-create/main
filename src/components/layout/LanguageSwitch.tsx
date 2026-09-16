"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <div className={cn("inline-flex rounded-full border border-sand-200 bg-white p-0.5", className)}>
      {(["lv", "en"] as const).map((code) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold uppercase transition",
            locale === code ? "bg-brand-600 text-white" : "text-ink-600 hover:text-ink-900",
          )}
          aria-pressed={locale === code}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
