"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "../types";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

const STORAGE_KEY = "derigs.locale";

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolve(dict: Dictionary, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], dict);
  return typeof value === "string" ? value : key;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with Latvian so the server and the first client render match;
  // a stored preference is applied right after hydration.
  const [locale, setLocaleState] = useState<Locale>("lv");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "lv") setLocaleState(stored);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const dict = DICTIONARIES[locale];
    const t: TranslateFn = (key, vars) => {
      let text = resolve(dict, key);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return text;
    };
    return { locale, setLocale, t, dict };
  }, [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}

/** Picks a localised field from data that carries both variants. */
export function pick(locale: Locale, lvValue: string, enValue?: string) {
  return locale === "en" && enValue ? enValue : lvValue;
}
