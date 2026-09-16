"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";

const HydrationContext = createContext(false);

/**
 * The mock backend lives in localStorage. Stores are rehydrated after mount so
 * the server-rendered HTML and the first client render always match.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      useDataStore.persist.rehydrate(),
      useSessionStore.persist.rehydrate(),
    ]).then(() => {
      if (cancelled) return;
      useDataStore.getState().seedIfNeeded();
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <LanguageProvider>
      <HydrationContext.Provider value={hydrated}>{children}</HydrationContext.Provider>
    </LanguageProvider>
  );
}

export function useHydrated() {
  return useContext(HydrationContext);
}
