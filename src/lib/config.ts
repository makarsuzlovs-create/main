import type { SellerType } from "./types";

export const BRAND = {
  name: "Derīgs",
  domain: "derigs.lv",
  taglineLv: "Glāb pārtiku. Ietaupi naudu.",
  taglineEn: "Save food. Save money.",
};

/**
 * The company that operates the platform. Used as the service provider block
 * on subscription invoices. Fictional — this is a prototype.
 */
export const PLATFORM_LEGAL_ENTITY = {
  name: "SIA \"Derīgs Platform\"",
  registrationNumber: "40000000000",
  vatNumber: "LV40000000000",
  legalAddress: "Brīvības iela 1, Rīga, LV-1010, Latvija",
  bank: "AS Demo Banka",
  iban: "LV00DEMO0000000000000",
  email: "rekini@derigs.lv",
  phone: "+371 20000000",
};

/**
 * Legal / fiscal parameters are configuration, never constants baked into
 * business logic. Rates and rules in Latvia can change, and they differ
 * between company sellers and private households.
 */
export const BILLING_CONFIG = {
  currency: "EUR" as const,
  defaultVatRate: 0.21,
  /** Reverse charge, exempt sellers etc. are resolved per customer later. */
  vatAppliesToDomesticCompanies: true,
  invoicePaymentTermDays: 10,
  invoiceNumberPrefix: "DER",
};

export type SellerRuleSet = {
  /** Can this seller type publish listings at all. */
  canPublish: boolean;
  requiresSubscription: boolean;
  requiresRegistrationNumber: boolean;
  requiresFoodSafetyDeclaration: boolean;
  /** null = no configured cap. */
  maxActiveListings: number | null;
  maxLocations: number | null;
  /** Households may be limited to a turnover ceiling for tax reasons. */
  monthlyTurnoverCapEur: number | null;
  /** Categories a seller type may not publish without extra approval. */
  restrictedCategories: string[];
  requiresAdminApproval: boolean;
};

/**
 * Editable rule sets per seller type. Nothing here is a legal statement —
 * the values are platform defaults that an administrator can change once the
 * applicable Latvian requirements are confirmed with a legal advisor.
 */
export const SELLER_RULES: Record<SellerType, SellerRuleSet> = {
  business: {
    canPublish: true,
    requiresSubscription: true,
    requiresRegistrationNumber: true,
    requiresFoodSafetyDeclaration: true,
    maxActiveListings: null,
    maxLocations: null,
    monthlyTurnoverCapEur: null,
    restrictedCategories: [],
    requiresAdminApproval: true,
  },
  household: {
    canPublish: true,
    requiresSubscription: false,
    requiresRegistrationNumber: false,
    requiresFoodSafetyDeclaration: true,
    maxActiveListings: 3,
    maxLocations: 1,
    monthlyTurnoverCapEur: 200,
    restrictedCategories: ["gatavie-edieni", "piena-produkti"],
    requiresAdminApproval: true,
  },
};

/** Feature flags for integrations that are intentionally not implemented. */
export const INTEGRATIONS = {
  /** No payment provider is connected: checkout never moves money. */
  payments: {
    enabled: false,
    provider: null as null | "stripe" | "montonio" | "klix",
  },
  /** Company registry lookup (Uzņēmumu reģistrs open data / VID). */
  companyRegistryLookup: {
    enabled: false,
    provider: null as null | "ur.gov.lv" | "lursoft",
  },
  /** Accounting export / e-invoice delivery. */
  accountingExport: {
    enabled: false,
    provider: null as null | "jumis" | "zoho" | "erp",
  },
  maps: {
    enabled: false,
    provider: null as null | "mapbox" | "google" | "openstreetmap",
  },
};

/** CO2 avoided per kg of rescued food, used for demo impact numbers. */
export const CO2_KG_PER_FOOD_KG = 2.5;
