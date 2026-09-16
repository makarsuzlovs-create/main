import { INTEGRATIONS } from "../config";
import type { RegistryCheck } from "../types";

export interface RegistryLookupResult {
  check: RegistryCheck;
  company?: {
    companyName: string;
    legalAddress: string;
    vatNumber?: string;
  };
}

/**
 * Placeholder for automatic verification of a Latvian company registration
 * number (Uzņēmumu reģistrs open data or a commercial provider).
 *
 * The integration is deliberately NOT implemented: the function reports
 * "not_checked" so the UI never claims a company was verified. Wiring a real
 * provider means replacing the body and flipping
 * INTEGRATIONS.companyRegistryLookup.enabled.
 */
export async function lookupCompany(registrationNumber: string): Promise<RegistryLookupResult> {
  if (!INTEGRATIONS.companyRegistryLookup.enabled) {
    return {
      check: {
        status: "not_checked",
        checkedAt: new Date().toISOString(),
        note: "Automātiskā reģistra pārbaude nav pieslēgta. Datus pārbauda administrators.",
      },
    };
  }
  throw new Error(`Registry provider not configured for ${registrationNumber}`);
}

/** Basic shape check only — 11 digits, as used in Latvia. */
export function isValidRegistrationNumberFormat(value: string) {
  return /^\d{11}$/.test(value.replace(/\s/g, ""));
}

export function isValidVatNumberFormat(value: string) {
  return /^LV\d{11}$/i.test(value.replace(/\s/g, ""));
}
