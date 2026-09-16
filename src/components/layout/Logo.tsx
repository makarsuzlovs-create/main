import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M4 13c0-3.9 3.1-7 7-7h6v2a7 7 0 0 1-7 7H8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M5 20c1.8-4 5-6.4 9-7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Logo({ href = "/", compact }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="text-[19px] font-extrabold tracking-tight text-ink-900">
          Derīgs
          <span className="text-brand-600">.</span>
        </span>
      )}
    </Link>
  );
}
