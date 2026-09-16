"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-200 disabled:bg-brand-300",
  secondary:
    "bg-clay-500 text-white shadow-sm hover:bg-clay-600 focus-visible:ring-clay-200 disabled:bg-clay-300",
  outline:
    "border border-sand-300 bg-white text-ink-800 hover:border-brand-400 hover:text-brand-700 focus-visible:ring-brand-100",
  ghost: "text-ink-700 hover:bg-sand-100 focus-visible:ring-sand-200",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200",
  dark: "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-600/30",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl gap-1.5",
  md: "h-11 px-4 text-[15px] rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-2xl gap-2",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  fullWidth,
  className,
  children,
  ...props
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center font-semibold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
