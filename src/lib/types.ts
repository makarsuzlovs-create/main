/**
 * Domain model for the Derīgs marketplace.
 *
 * These interfaces mirror the intended relational schema (see docs/DATABASE.md)
 * so the mock data layer in `src/lib/store` can later be swapped for Supabase /
 * PostgreSQL without changing component code.
 */

export type Locale = "lv" | "en";

export type UserRole = "customer" | "business" | "household" | "admin";

export type AccountStatus = "active" | "suspended" | "deleted";

/** Verification state shown in the admin panel. */
export type VerificationStatus = "pending" | "approved" | "rejected" | "suspended";

export type SellerType = "business" | "household";

export type DateLabelType = "best_before" | "use_by";

export type ListingStatus =
  | "draft"
  | "active"
  | "sold_out"
  | "expired"
  | "removed"
  | "suspended";

export type OrderStatus =
  | "pending_payment"
  | "reserved"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"
  | "expired";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded" | "failed";

export type PaymentMethod = "card" | "pay_on_pickup";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";

export type BillingInterval = "monthly" | "annual";

export type Unit = "piece" | "kg" | "package" | "portion" | "liter";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  /** Mock only — a real backend never stores plaintext passwords. */
  password: string;
  fullName: string;
  phone?: string;
  city?: string;
  status: AccountStatus;
  /** Set when role === "business". */
  businessId?: string;
  /** Set when role === "household". */
  householdSellerId?: string;
  createdAt: string;
  demo?: boolean;
}

export interface Business {
  id: string;
  ownerUserId: string;
  companyName: string;
  /** Latvian company registration number (reģistrācijas numurs). */
  registrationNumber: string;
  /** Optional — not every company is VAT registered. */
  vatNumber?: string;
  legalAddress: string;
  responsiblePerson: string;
  email: string;
  phone: string;
  invoiceEmail: string;
  bankName?: string;
  iban?: string;
  categorySlug: string;
  description?: string;
  logoEmoji?: string;
  coverImage?: string;
  rating?: number;
  reviewCount?: number;
  verificationStatus: VerificationStatus;
  /**
   * Result of an automated registry lookup. Currently always "not_checked" —
   * the field exists so an Uzņēmumu reģistrs / VID API check can be wired in
   * later (see src/lib/services/registryLookup.ts).
   */
  registryCheck: RegistryCheck;
  termsAcceptedAt?: string;
  foodSafetyAcceptedAt?: string;
  createdAt: string;
  demo?: boolean;
}

export interface RegistryCheck {
  status: "not_checked" | "pending" | "verified" | "mismatch" | "not_found";
  checkedAt?: string;
  source?: string;
  note?: string;
}

export interface HouseholdSeller {
  id: string;
  ownerUserId: string;
  displayName: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  /** Households are rule-limited; limits live in config, not in code paths. */
  verificationStatus: VerificationStatus;
  rulesAcceptedAt?: string;
  createdAt: string;
  demo?: boolean;
}

export interface Location {
  id: string;
  sellerType: SellerType;
  sellerId: string;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  lat: number;
  lng: number;
  openingHours?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  slug: string;
  nameLv: string;
  nameEn: string;
  emoji: string;
  isActive: boolean;
  sortOrder: number;
}

/** A listing is a concrete offer of a product at a location. */
export interface Listing {
  id: string;
  sellerType: SellerType;
  sellerId: string;
  locationId: string;
  title: string;
  titleEn?: string;
  categorySlug: string;
  description: string;
  descriptionEn?: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  quantityInitial: number;
  unit: Unit;
  /** Approximate weight of one item, used for the "kg saved" statistic. */
  estimatedWeightKg: number;
  dateLabelType: DateLabelType;
  bestBeforeDate: string;
  /** Listing stops being sellable after this moment. */
  pickupDeadline: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  allergens: string[];
  storageRequirements: string;
  status: ListingStatus;
  isSurpriseBag?: boolean;
  createdAt: string;
  updatedAt: string;
  demo?: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  listingId: string;
  titleSnapshot: string;
  unitPrice: number;
  originalUnitPrice: number;
  quantity: number;
  estimatedWeightKg: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  pickupCode: string;
  customerUserId: string;
  customerName: string;
  sellerType: SellerType;
  sellerId: string;
  sellerName: string;
  locationId: string;
  pickupAddress: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  savedAmount: number;
  savedFoodKg: number;
  status: OrderStatus;
  paymentId?: string;
  createdAt: string;
  demo?: boolean;
}

export interface Payment {
  id: string;
  orderId?: string;
  subscriptionId?: string;
  amount: number;
  currency: "EUR";
  method: PaymentMethod;
  status: PaymentStatus;
  /** Reserved for a future Stripe / payment provider integration. */
  providerReference?: string;
  createdAt: string;
}

export interface PlanLimits {
  activeListings: number | "unlimited";
  locations: number | "unlimited";
  analytics: "basic" | "advanced" | "full";
  invoiceAutomation: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

export interface SubscriptionPlan {
  id: string;
  code: "START" | "GROW" | "PRO" | string;
  nameLv: string;
  nameEn: string;
  descriptionLv: string;
  descriptionEn: string;
  /** null = price not decided yet, the UI then renders "€XX / mēnesī". */
  monthlyPrice: number | null;
  annualPrice: number | null;
  currency: "EUR";
  limits: PlanLimits;
  featuresLv: string[];
  featuresEn: string[];
  isActive: boolean;
  isHighlighted?: boolean;
  availableFor: SellerType[];
  sortOrder: number;
}

export interface Subscription {
  id: string;
  sellerType: SellerType;
  sellerId: string;
  planId: string;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subscriptionId?: string;
  sellerType: SellerType;
  sellerId: string;
  /** Snapshot of the buyer's billing details at issue time. */
  customerName: string;
  customerRegistrationNumber?: string;
  customerVatNumber?: string;
  customerLegalAddress: string;
  customerInvoiceEmail: string;
  periodStart: string;
  periodEnd: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: "EUR";
  status: PaymentStatus;
  paidAt?: string;
  demo?: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  sellerType: SellerType;
  sellerId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  sellerType: SellerType;
  sellerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  titleLv: string;
  titleEn: string;
  bodyLv: string;
  bodyEn: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ImpactStatistic {
  id: string;
  scope: "platform" | "seller" | "user";
  scopeId?: string;
  periodStart: string;
  periodEnd: string;
  savedItems: number;
  savedFoodKg: number;
  savedMoney: number;
  co2AvoidedKg: number;
}

export interface Report {
  id: string;
  targetType: "listing" | "user" | "business";
  targetId: string;
  targetLabel: string;
  reason: string;
  reportedByUserId: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
}

/** Cart line kept client-side until checkout creates the order. */
export interface CartItem {
  listingId: string;
  quantity: number;
}

export interface SelectedLocation {
  label: string;
  lat: number;
  lng: number;
}

export interface SessionUser {
  id: string;
  role: UserRole;
  email: string;
  fullName: string;
  businessId?: string;
  householdSellerId?: string;
}
