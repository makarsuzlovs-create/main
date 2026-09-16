"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BILLING_CONFIG, SELLER_RULES } from "../config";
import { CATEGORIES } from "../data/categories";
import { buildDemoListings } from "../data/listings";
import { DEMO_PLANS } from "../data/plans";
import {
  buildDemoImpact,
  buildDemoInvoices,
  buildDemoNotifications,
  buildDemoOrders,
  buildDemoReports,
  buildDemoReviews,
  buildDemoSubscriptions,
} from "../data/seed";
import {
  DEMO_BUSINESSES,
  DEMO_HOUSEHOLD_SELLERS,
  DEMO_LOCATIONS,
  DEMO_USERS,
} from "../data/sellers";
import type {
  Business,
  BillingInterval,
  CartItem,
  Category,
  HouseholdSeller,
  ImpactStatistic,
  Invoice,
  Listing,
  Location,
  Notification,
  Order,
  Report,
  Review,
  SellerType,
  SessionUser,
  Subscription,
  SubscriptionPlan,
  User,
  VerificationStatus,
} from "../types";
import { addDays, generateOrderNumber, generatePickupCode, randomId } from "../utils";

export interface NewListingInput {
  sellerType: SellerType;
  sellerId: string;
  locationId: string;
  title: string;
  categorySlug: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  unit: Listing["unit"];
  estimatedWeightKg: number;
  dateLabelType: Listing["dateLabelType"];
  bestBeforeDate: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  allergens: string[];
  storageRequirements: string;
  isSurpriseBag?: boolean;
  status?: Listing["status"];
}

interface DataState {
  seededAt: string | null;
  users: User[];
  businesses: Business[];
  households: HouseholdSeller[];
  locations: Location[];
  categories: Category[];
  listings: Listing[];
  orders: Order[];
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  reviews: Review[];
  notifications: Notification[];
  reports: Report[];
  impact: ImpactStatistic[];
  favorites: { id: string; userId: string; sellerType: SellerType; sellerId: string }[];

  seedIfNeeded: () => void;
  resetDemoData: () => void;

  // auth
  authenticate: (email: string, password: string) => SessionUser | null;
  registerCustomer: (input: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    city?: string;
  }) => { ok: true; user: SessionUser } | { ok: false; error: "email_taken" };
  registerBusiness: (input: {
    email: string;
    password: string;
    companyName: string;
    registrationNumber: string;
    vatNumber?: string;
    legalAddress: string;
    pickupAddress: string;
    pickupCity: string;
    responsiblePerson: string;
    phone: string;
    invoiceEmail: string;
    bankName?: string;
    iban?: string;
    categorySlug: string;
    description?: string;
  }) => { ok: true; user: SessionUser } | { ok: false; error: "email_taken" };
  registerHousehold: (input: {
    email: string;
    password: string;
    fullName: string;
    displayName: string;
    phone: string;
    city: string;
    address: string;
  }) => { ok: true; user: SessionUser } | { ok: false; error: "email_taken" };

  // listings
  createListing: (input: NewListingInput) => Listing;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  setListingStatus: (id: string, status: Listing["status"]) => void;
  removeListing: (id: string) => void;

  // orders
  createOrdersFromCart: (
    cart: CartItem[],
    user: SessionUser,
  ) => { ok: true; orders: Order[] } | { ok: false; error: "unavailable" };
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;

  // locations
  addLocation: (input: Omit<Location, "id">) => Location;
  updateLocation: (id: string, patch: Partial<Location>) => void;

  // business profile
  updateBusiness: (id: string, patch: Partial<Business>) => void;
  updateHousehold: (id: string, patch: Partial<HouseholdSeller>) => void;
  setVerification: (
    sellerType: SellerType,
    sellerId: string,
    status: VerificationStatus,
  ) => void;

  // subscriptions and invoices
  changePlan: (
    sellerType: SellerType,
    sellerId: string,
    planId: string,
    interval: BillingInterval,
  ) => { subscription: Subscription; invoice: Invoice | null };
  cancelSubscription: (subscriptionId: string, cancel: boolean) => void;
  markInvoicePaid: (invoiceId: string) => void;
  updatePlans: (plans: SubscriptionPlan[]) => void;

  // admin
  setUserStatus: (userId: string, status: User["status"]) => void;
  upsertCategory: (category: Category) => void;
  setReportStatus: (reportId: string, status: Report["status"]) => void;

  // favorites
  toggleFavorite: (userId: string, sellerType: SellerType, sellerId: string) => void;
  markNotificationRead: (id: string) => void;
}

function buildSeed(now: Date) {
  return {
    seededAt: now.toISOString(),
    users: DEMO_USERS,
    businesses: DEMO_BUSINESSES,
    households: DEMO_HOUSEHOLD_SELLERS,
    locations: DEMO_LOCATIONS,
    categories: CATEGORIES,
    listings: buildDemoListings(now),
    orders: buildDemoOrders(now),
    plans: DEMO_PLANS,
    subscriptions: buildDemoSubscriptions(now),
    invoices: buildDemoInvoices(now),
    reviews: buildDemoReviews(),
    notifications: buildDemoNotifications(now),
    reports: buildDemoReports(now),
    impact: buildDemoImpact(now),
    favorites: [
      { id: "fav_1", userId: "usr_customer", sellerType: "business" as SellerType, sellerId: "biz_rudzu_rits" },
    ],
  };
}

function planLimits(state: DataState, sellerType: SellerType, sellerId: string) {
  const sub = state.subscriptions.find(
    (s) => s.sellerId === sellerId && s.status !== "cancelled",
  );
  const plan = state.plans.find((p) => p.id === sub?.planId);
  const rules = SELLER_RULES[sellerType];
  const planListings = plan?.limits.activeListings;
  const planLocations = plan?.limits.locations;
  return {
    maxListings:
      planListings === "unlimited"
        ? null
        : typeof planListings === "number"
          ? planListings
          : rules.maxActiveListings,
    maxLocations:
      planLocations === "unlimited"
        ? null
        : typeof planLocations === "number"
          ? planLocations
          : rules.maxLocations,
  };
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      seededAt: null,
      users: [],
      businesses: [],
      households: [],
      locations: [],
      categories: [],
      listings: [],
      orders: [],
      plans: [],
      subscriptions: [],
      invoices: [],
      reviews: [],
      notifications: [],
      reports: [],
      impact: [],
      favorites: [],

      seedIfNeeded: () => {
        const state = get();
        const now = new Date();
        if (!state.seededAt) {
          set(buildSeed(now));
          return;
        }
        // Demo listings and orders are date-relative: refresh them once a day
        // so the prototype always has live offers, keeping anything the user
        // created themselves.
        const seeded = new Date(state.seededAt);
        const sameDay =
          seeded.getFullYear() === now.getFullYear() &&
          seeded.getMonth() === now.getMonth() &&
          seeded.getDate() === now.getDate();
        if (sameDay) return;
        const fresh = buildSeed(now);
        set({
          seededAt: fresh.seededAt,
          listings: [
            ...fresh.listings,
            ...state.listings.filter((l) => !l.demo),
          ],
          orders: [...fresh.orders, ...state.orders.filter((o) => !o.demo)],
          invoices: [...fresh.invoices, ...state.invoices.filter((i) => !i.demo)],
          impact: fresh.impact,
        });
      },

      resetDemoData: () => set(buildSeed(new Date())),

      authenticate: (email, password) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
        );
        if (!user || user.status !== "active") return null;
        return {
          id: user.id,
          role: user.role,
          email: user.email,
          fullName: user.fullName,
          businessId: user.businessId,
          householdSellerId: user.householdSellerId,
        };
      },

      registerCustomer: (input) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === input.email.trim().toLowerCase(),
        );
        if (exists) return { ok: false, error: "email_taken" };
        const user: User = {
          id: randomId("usr"),
          role: "customer",
          email: input.email.trim(),
          password: input.password,
          fullName: input.fullName,
          phone: input.phone,
          city: input.city,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, user] }));
        return {
          ok: true,
          user: { id: user.id, role: user.role, email: user.email, fullName: user.fullName },
        };
      },

      registerBusiness: (input) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === input.email.trim().toLowerCase(),
        );
        if (exists) return { ok: false, error: "email_taken" };
        const now = new Date().toISOString();
        const businessId = randomId("biz");
        const userId = randomId("usr");
        const business: Business = {
          id: businessId,
          ownerUserId: userId,
          companyName: input.companyName,
          registrationNumber: input.registrationNumber,
          vatNumber: input.vatNumber || undefined,
          legalAddress: input.legalAddress,
          responsiblePerson: input.responsiblePerson,
          email: input.email.trim(),
          phone: input.phone,
          invoiceEmail: input.invoiceEmail,
          bankName: input.bankName,
          iban: input.iban,
          categorySlug: input.categorySlug,
          description: input.description,
          logoEmoji: "🏪",
          verificationStatus: "pending",
          registryCheck: {
            status: "not_checked",
            note: "Automātiska reģistra pārbaude vēl nav ieslēgta.",
          },
          termsAcceptedAt: now,
          foodSafetyAcceptedAt: now,
          createdAt: now,
        };
        const user: User = {
          id: userId,
          role: "business",
          email: input.email.trim(),
          password: input.password,
          fullName: input.responsiblePerson,
          phone: input.phone,
          status: "active",
          businessId,
          createdAt: now,
        };
        const location: Location = {
          id: randomId("loc"),
          sellerType: "business",
          sellerId: businessId,
          name: input.companyName,
          address: input.pickupAddress,
          city: input.pickupCity,
          lat: 56.9496 + (Math.random() - 0.5) * 0.06,
          lng: 24.1052 + (Math.random() - 0.5) * 0.1,
          isActive: true,
        };
        set((s) => ({
          users: [...s.users, user],
          businesses: [...s.businesses, business],
          locations: [...s.locations, location],
        }));
        return {
          ok: true,
          user: {
            id: user.id,
            role: "business",
            email: user.email,
            fullName: user.fullName,
            businessId,
          },
        };
      },

      registerHousehold: (input) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === input.email.trim().toLowerCase(),
        );
        if (exists) return { ok: false, error: "email_taken" };
        const now = new Date().toISOString();
        const sellerId = randomId("hh");
        const userId = randomId("usr");
        const seller: HouseholdSeller = {
          id: sellerId,
          ownerUserId: userId,
          displayName: input.displayName,
          fullName: input.fullName,
          email: input.email.trim(),
          phone: input.phone,
          city: input.city,
          verificationStatus: "pending",
          rulesAcceptedAt: now,
          createdAt: now,
        };
        const user: User = {
          id: userId,
          role: "household",
          email: input.email.trim(),
          password: input.password,
          fullName: input.fullName,
          phone: input.phone,
          city: input.city,
          status: "active",
          householdSellerId: sellerId,
          createdAt: now,
        };
        const location: Location = {
          id: randomId("loc"),
          sellerType: "household",
          sellerId,
          name: input.displayName,
          address: input.address,
          city: input.city,
          lat: 56.9496 + (Math.random() - 0.5) * 0.06,
          lng: 24.1052 + (Math.random() - 0.5) * 0.1,
          isActive: true,
        };
        set((s) => ({
          users: [...s.users, user],
          households: [...s.households, seller],
          locations: [...s.locations, location],
        }));
        return {
          ok: true,
          user: {
            id: user.id,
            role: "household",
            email: user.email,
            fullName: user.fullName,
            householdSellerId: sellerId,
          },
        };
      },

      createListing: (input) => {
        const now = new Date().toISOString();
        const listing: Listing = {
          id: randomId("lst"),
          sellerType: input.sellerType,
          sellerId: input.sellerId,
          locationId: input.locationId,
          title: input.title,
          categorySlug: input.categorySlug,
          description: input.description,
          image: "",
          originalPrice: input.originalPrice,
          discountedPrice: input.discountedPrice,
          quantity: input.quantity,
          quantityInitial: input.quantity,
          unit: input.unit,
          estimatedWeightKg: input.estimatedWeightKg,
          dateLabelType: input.dateLabelType,
          bestBeforeDate: input.bestBeforeDate,
          pickupDeadline: input.pickupWindowEnd,
          pickupWindowStart: input.pickupWindowStart,
          pickupWindowEnd: input.pickupWindowEnd,
          allergens: input.allergens,
          storageRequirements: input.storageRequirements,
          status: input.status ?? "active",
          isSurpriseBag: input.isSurpriseBag,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ listings: [listing, ...s.listings] }));
        return listing;
      },

      updateListing: (id, patch) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l,
          ),
        })),

      setListingStatus: (id, status) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l,
          ),
        })),

      removeListing: (id) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, status: "removed", updatedAt: new Date().toISOString() } : l,
          ),
        })),

      createOrdersFromCart: (cart, user) => {
        const state = get();
        const now = new Date();
        const lines = cart
          .map((item) => ({
            item,
            listing: state.listings.find((l) => l.id === item.listingId),
          }))
          .filter((l): l is { item: CartItem; listing: Listing } => Boolean(l.listing));
        if (!lines.length) return { ok: false, error: "unavailable" };
        const unavailable = lines.some(
          ({ item, listing }) =>
            listing.status !== "active" ||
            listing.quantity < item.quantity ||
            new Date(listing.pickupDeadline).getTime() <= now.getTime(),
        );
        if (unavailable) return { ok: false, error: "unavailable" };

        const bySeller = new Map<string, typeof lines>();
        for (const line of lines) {
          const key = `${line.listing.sellerType}:${line.listing.sellerId}:${line.listing.locationId}`;
          bySeller.set(key, [...(bySeller.get(key) ?? []), line]);
        }

        const orders: Order[] = [];
        for (const group of Array.from(bySeller.values())) {
          const first = group[0].listing;
          const location = state.locations.find((l) => l.id === first.locationId);
          const sellerName =
            first.sellerType === "business"
              ? (state.businesses.find((b) => b.id === first.sellerId)?.companyName ?? "")
              : (state.households.find((h) => h.id === first.sellerId)?.displayName ?? "");
          const orderId = randomId("ord");
          const items = group.map(({ item, listing }) => ({
            id: randomId("oi"),
            orderId,
            listingId: listing.id,
            titleSnapshot: listing.title,
            unitPrice: listing.discountedPrice,
            originalUnitPrice: listing.originalPrice,
            quantity: item.quantity,
            estimatedWeightKg: listing.estimatedWeightKg,
          }));
          const subtotal = +items
            .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
            .toFixed(2);
          const savedAmount = +items
            .reduce((sum, i) => sum + (i.originalUnitPrice - i.unitPrice) * i.quantity, 0)
            .toFixed(2);
          const savedFoodKg = +items
            .reduce((sum, i) => sum + i.estimatedWeightKg * i.quantity, 0)
            .toFixed(2);
          orders.push({
            id: orderId,
            orderNumber: generateOrderNumber(),
            pickupCode: generatePickupCode(),
            customerUserId: user.id,
            customerName: user.fullName,
            sellerType: first.sellerType,
            sellerId: first.sellerId,
            sellerName,
            locationId: first.locationId,
            pickupAddress: location?.address ?? "",
            pickupWindowStart: first.pickupWindowStart,
            pickupWindowEnd: first.pickupWindowEnd,
            items,
            subtotal,
            total: subtotal,
            savedAmount,
            savedFoodKg,
            status: "reserved",
            createdAt: now.toISOString(),
          });
        }

        set((s) => ({
          orders: [...orders, ...s.orders],
          listings: s.listings.map((listing) => {
            const ordered = lines
              .filter((l) => l.listing.id === listing.id)
              .reduce((sum, l) => sum + l.item.quantity, 0);
            if (!ordered) return listing;
            const quantity = Math.max(0, listing.quantity - ordered);
            return {
              ...listing,
              quantity,
              status: quantity === 0 ? "sold_out" : listing.status,
              updatedAt: now.toISOString(),
            };
          }),
          notifications: [
            ...orders.map((o) => ({
              id: randomId("ntf"),
              userId: o.customerUserId,
              titleLv: "Pasūtījums apstiprināts",
              titleEn: "Order confirmed",
              bodyLv: `${o.sellerName} — saņemšanas kods ${o.pickupCode}`,
              bodyEn: `${o.sellerName} — pickup code ${o.pickupCode}`,
              read: false,
              createdAt: now.toISOString(),
              link: "/pasutijumi",
            })),
            ...s.notifications,
          ],
        }));
        return { ok: true, orders };
      },

      updateOrderStatus: (orderId, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        })),

      addLocation: (input) => {
        const location: Location = { ...input, id: randomId("loc") };
        set((s) => ({ locations: [...s.locations, location] }));
        return location;
      },

      updateLocation: (id, patch) =>
        set((s) => ({
          locations: s.locations.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),

      updateBusiness: (id, patch) =>
        set((s) => ({
          businesses: s.businesses.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),

      updateHousehold: (id, patch) =>
        set((s) => ({
          households: s.households.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),

      setVerification: (sellerType, sellerId, status) =>
        set((s) =>
          sellerType === "business"
            ? {
                businesses: s.businesses.map((b) =>
                  b.id === sellerId ? { ...b, verificationStatus: status } : b,
                ),
              }
            : {
                households: s.households.map((h) =>
                  h.id === sellerId ? { ...h, verificationStatus: status } : h,
                ),
              },
        ),

      changePlan: (sellerType, sellerId, planId, interval) => {
        const state = get();
        const now = new Date();
        const plan = state.plans.find((p) => p.id === planId);
        const existing = state.subscriptions.find((s) => s.sellerId === sellerId);
        const periodStart = now;
        const periodEnd =
          interval === "monthly" ? addDays(now, 30) : addDays(now, 365);
        const subscription: Subscription = existing
          ? {
              ...existing,
              planId,
              interval,
              status: "active",
              cancelAtPeriodEnd: false,
              currentPeriodStart: periodStart.toISOString(),
              currentPeriodEnd: periodEnd.toISOString(),
            }
          : {
              id: randomId("sub"),
              sellerType,
              sellerId,
              planId,
              status: "active",
              interval,
              currentPeriodStart: periodStart.toISOString(),
              currentPeriodEnd: periodEnd.toISOString(),
              cancelAtPeriodEnd: false,
              createdAt: now.toISOString(),
            };

        const business = state.businesses.find((b) => b.id === sellerId);
        const price = interval === "monthly" ? plan?.monthlyPrice : plan?.annualPrice;
        let invoice: Invoice | null = null;
        // An invoice is only issued once a price has been configured by an
        // administrator — placeholder plans produce no billing document.
        if (business && plan && price && price > 0) {
          const vatRate = business.vatNumber ? BILLING_CONFIG.defaultVatRate : 0;
          const invoiceId = randomId("inv");
          const seq = state.invoices.length + 1;
          const vatAmount = +(price * vatRate).toFixed(2);
          invoice = {
            id: invoiceId,
            invoiceNumber: `${BILLING_CONFIG.invoiceNumberPrefix}-${now.getFullYear()}-${String(seq).padStart(4, "0")}`,
            issueDate: now.toISOString(),
            dueDate: addDays(now, BILLING_CONFIG.invoicePaymentTermDays).toISOString(),
            subscriptionId: subscription.id,
            sellerType: "business",
            sellerId,
            customerName: business.companyName,
            customerRegistrationNumber: business.registrationNumber,
            customerVatNumber: business.vatNumber,
            customerLegalAddress: business.legalAddress,
            customerInvoiceEmail: business.invoiceEmail,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
            items: [
              {
                id: randomId("ii"),
                invoiceId,
                description: `Derīgs platformas abonements — ${plan.code} (${
                  interval === "monthly" ? "mēnesis" : "gads"
                })`,
                quantity: 1,
                unitPrice: price,
                vatRate,
                lineTotal: price,
              },
            ],
            subtotal: price,
            vatRate,
            vatAmount,
            total: +(price + vatAmount).toFixed(2),
            currency: "EUR",
            status: "unpaid",
          };
        }

        set((s) => ({
          subscriptions: existing
            ? s.subscriptions.map((sub) => (sub.id === subscription.id ? subscription : sub))
            : [...s.subscriptions, subscription],
          invoices: invoice ? [invoice, ...s.invoices] : s.invoices,
        }));
        return { subscription, invoice };
      },

      cancelSubscription: (subscriptionId, cancel) =>
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) =>
            sub.id === subscriptionId ? { ...sub, cancelAtPeriodEnd: cancel } : sub,
          ),
        })),

      markInvoicePaid: (invoiceId) =>
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === invoiceId
              ? { ...i, status: "paid", paidAt: new Date().toISOString() }
              : i,
          ),
        })),

      updatePlans: (plans) => set({ plans }),

      setUserStatus: (userId, status) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, status } : u)),
        })),

      upsertCategory: (category) =>
        set((s) => ({
          categories: s.categories.some((c) => c.id === category.id)
            ? s.categories.map((c) => (c.id === category.id ? category : c))
            : [...s.categories, category],
        })),

      setReportStatus: (reportId, status) =>
        set((s) => ({
          reports: s.reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
        })),

      toggleFavorite: (userId, sellerType, sellerId) =>
        set((s) => {
          const existing = s.favorites.find(
            (f) => f.userId === userId && f.sellerId === sellerId,
          );
          return {
            favorites: existing
              ? s.favorites.filter((f) => f.id !== existing.id)
              : [...s.favorites, { id: randomId("fav"), userId, sellerType, sellerId }],
          };
        }),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
    }),
    {
      name: "derigs.data.v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/** Limits that apply to a seller, combining plan limits and seller-type rules. */
export function sellerLimits(state: DataState, sellerType: SellerType, sellerId: string) {
  return planLimits(state, sellerType, sellerId);
}

export type { DataState };
