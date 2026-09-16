import { BILLING_CONFIG } from "../config";
import type {
  ImpactStatistic,
  Invoice,
  Notification,
  Order,
  Report,
  Review,
  Subscription,
} from "../types";
import { addDays } from "../utils";
import { buildDemoListings } from "./listings";
import { DEMO_BUSINESSES, DEMO_LOCATIONS } from "./sellers";

/** Deterministic pseudo-random generator so demo data is stable per day. */
function lcg(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const DEMO_CUSTOMERS = [
  { id: "usr_customer", name: "Anna Bērziņa" },
  { id: "usr_demo_2", name: "Kārlis Siliņš" },
  { id: "usr_demo_3", name: "Elīza Grīnberga" },
  { id: "usr_demo_4", name: "Toms Vanags" },
  { id: "usr_demo_5", name: "Marta Lapsa" },
];

/**
 * Historic orders for dashboards and charts. Roughly 8 weeks of activity,
 * including a few orders placed today.
 */
export function buildDemoOrders(now: Date = new Date()): Order[] {
  const listings = buildDemoListings(now);
  const rand = lcg(20260916);
  const orders: Order[] = [];

  for (let dayOffset = 56; dayOffset >= 0; dayOffset--) {
    const day = addDays(now, -dayOffset);
    const weekday = day.getDay();
    const base = weekday === 0 || weekday === 6 ? 3 : 5;
    const count = Math.max(1, Math.round(base + rand() * 4));
    for (let i = 0; i < count; i++) {
      const listing = listings[Math.floor(rand() * listings.length)];
      const location = DEMO_LOCATIONS.find((l) => l.id === listing.locationId)!;
      const business = DEMO_BUSINESSES.find((b) => b.id === listing.sellerId);
      const customer = DEMO_CUSTOMERS[Math.floor(rand() * DEMO_CUSTOMERS.length)];
      const qty = 1 + Math.floor(rand() * 2);
      const createdAt = new Date(day);
      createdAt.setHours(9 + Math.floor(rand() * 11), Math.floor(rand() * 60), 0, 0);
      const subtotal = +(listing.discountedPrice * qty).toFixed(2);
      const saved = +((listing.originalPrice - listing.discountedPrice) * qty).toFixed(2);
      const idx = orders.length + 1;
      orders.push({
        id: `ord_demo_${idx}`,
        orderNumber: `DER-${(100000 + idx * 37).toString(36).toUpperCase().padStart(6, "0")}`,
        pickupCode: String(1000 + ((idx * 137) % 9000)),
        customerUserId: customer.id,
        customerName: customer.name,
        sellerType: listing.sellerType,
        sellerId: listing.sellerId,
        sellerName:
          business?.companyName ?? (listing.sellerId === "hh_ilze" ? "Ilzes virtuve" : "Pārdevējs"),
        locationId: listing.locationId,
        pickupAddress: location.address,
        pickupWindowStart: listing.pickupWindowStart,
        pickupWindowEnd: listing.pickupWindowEnd,
        items: [
          {
            id: `oi_demo_${idx}`,
            orderId: `ord_demo_${idx}`,
            listingId: listing.id,
            titleSnapshot: listing.title,
            unitPrice: listing.discountedPrice,
            originalUnitPrice: listing.originalPrice,
            quantity: qty,
            estimatedWeightKg: listing.estimatedWeightKg,
          },
        ],
        subtotal,
        total: subtotal,
        savedAmount: saved,
        savedFoodKg: +(listing.estimatedWeightKg * qty).toFixed(2),
        status: dayOffset === 0 ? "reserved" : "completed",
        createdAt: createdAt.toISOString(),
        demo: true,
      });
    }
  }
  return orders;
}

export function buildDemoSubscriptions(now: Date = new Date()): Subscription[] {
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59);
  return [
    {
      id: "sub_rudzu",
      sellerType: "business",
      sellerId: "biz_rudzu_rits",
      planId: "plan_grow",
      status: "active",
      interval: "monthly",
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: "2026-01-05T10:00:00.000Z",
    },
    {
      id: "sub_grozs",
      sellerType: "business",
      sellerId: "biz_zalais_grozs",
      planId: "plan_pro",
      status: "active",
      interval: "annual",
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: "2026-01-08T10:00:00.000Z",
    },
    {
      id: "sub_lasite",
      sellerType: "business",
      sellerId: "biz_lasite",
      planId: "plan_start",
      status: "active",
      interval: "monthly",
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: true,
      createdAt: "2026-01-19T10:00:00.000Z",
    },
    {
      id: "sub_juras",
      sellerType: "business",
      sellerId: "biz_juras_vejs",
      planId: "plan_start",
      status: "past_due",
      interval: "monthly",
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: "2026-02-01T10:00:00.000Z",
    },
  ];
}

/**
 * Historic subscription invoices. The amounts are demo placeholders — final
 * subscription pricing has not been decided.
 */
const DEMO_MONTHLY_FEE = 29;

export function buildDemoInvoices(now: Date = new Date()): Invoice[] {
  const invoices: Invoice[] = [];
  const subs = buildDemoSubscriptions(now);
  let counter = 1;
  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const periodStart = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59);
    for (const sub of subs) {
      const business = DEMO_BUSINESSES.find((b) => b.id === sub.sellerId);
      if (!business) continue;
      const vatRate = business.vatNumber ? BILLING_CONFIG.defaultVatRate : 0;
      const subtotal = DEMO_MONTHLY_FEE;
      const vatAmount = +(subtotal * vatRate).toFixed(2);
      const id = `inv_demo_${counter}`;
      const number = `${BILLING_CONFIG.invoiceNumberPrefix}-${periodStart.getFullYear()}-${String(
        counter,
      ).padStart(4, "0")}`;
      const unpaid = monthsAgo === 0 && sub.status === "past_due";
      invoices.push({
        id,
        invoiceNumber: number,
        issueDate: periodStart.toISOString(),
        dueDate: addDays(periodStart, BILLING_CONFIG.invoicePaymentTermDays).toISOString(),
        subscriptionId: sub.id,
        sellerType: "business",
        sellerId: business.id,
        customerName: business.companyName,
        customerRegistrationNumber: business.registrationNumber,
        customerVatNumber: business.vatNumber,
        customerLegalAddress: business.legalAddress,
        customerInvoiceEmail: business.invoiceEmail,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        items: [
          {
            id: `ii_demo_${counter}`,
            invoiceId: id,
            description: `Derīgs platformas abonements (${sub.planId.replace("plan_", "").toUpperCase()})`,
            quantity: 1,
            unitPrice: subtotal,
            vatRate,
            lineTotal: subtotal,
          },
        ],
        subtotal,
        vatRate,
        vatAmount,
        total: +(subtotal + vatAmount).toFixed(2),
        currency: "EUR",
        status: unpaid ? "unpaid" : "paid",
        paidAt: unpaid ? undefined : addDays(periodStart, 2).toISOString(),
        demo: true,
      });
      counter++;
    }
  }
  return invoices;
}

export function buildDemoReviews(): Review[] {
  return [
    {
      id: "rev_1",
      orderId: "ord_demo_3",
      userId: "usr_customer",
      sellerType: "business",
      sellerId: "biz_rudzu_rits",
      rating: 5,
      comment: "Paka bija pilna un maize vēl silta. Noteikti ņemšu atkal.",
      createdAt: "2026-09-01T18:30:00.000Z",
    },
    {
      id: "rev_2",
      orderId: "ord_demo_8",
      userId: "usr_demo_2",
      sellerType: "business",
      sellerId: "biz_lasite",
      rating: 4,
      comment: "Labas sviestmaizes, tikai saņemšanas laiks ir īss.",
      createdAt: "2026-09-04T20:10:00.000Z",
    },
    {
      id: "rev_3",
      orderId: "ord_demo_12",
      userId: "usr_demo_3",
      sellerType: "business",
      sellerId: "biz_darza_tirgus",
      rating: 5,
      comment: "Par 4,50 € dabūju pilnu kasti dārzeņu. Lieliski!",
      createdAt: "2026-09-08T16:45:00.000Z",
    },
  ];
}

export function buildDemoNotifications(now: Date = new Date()): Notification[] {
  return [
    {
      id: "ntf_1",
      userId: "usr_customer",
      titleLv: "Tavs pasūtījums ir apstiprināts",
      titleEn: "Your order is confirmed",
      bodyLv: "Saņem to šodien 18:00–20:00, Tērbatas iela 45.",
      bodyEn: "Collect it today 18:00–20:00, Tērbatas iela 45.",
      read: false,
      createdAt: addDays(now, -1).toISOString(),
      link: "/pasutijumi",
    },
    {
      id: "ntf_2",
      userId: "usr_business",
      titleLv: "Jauns pasūtījums",
      titleEn: "New order",
      bodyLv: "Rīta maiznīcas paka × 2. Saņemšana šodien 18:00–20:00.",
      bodyEn: "Morning bakery bag × 2. Pickup today 18:00–20:00.",
      read: false,
      createdAt: addDays(now, 0).toISOString(),
      link: "/biznesa-panelis/pasutijumi",
    },
  ];
}

export function buildDemoReports(now: Date = new Date()): Report[] {
  return [
    {
      id: "rep_1",
      targetType: "listing",
      targetId: "lst_brokastu_paka",
      targetLabel: "Viesnīcas brokastu paka",
      reason: "Apraksts neatbilst saņemtajam produktam",
      reportedByUserId: "usr_demo_2",
      status: "reviewing",
      createdAt: addDays(now, -2).toISOString(),
    },
    {
      id: "rep_2",
      targetType: "business",
      targetId: "biz_vecpilseta",
      targetLabel: "SIA \"Viesnīca Vecpilsētas Nams\"",
      reason: "Atkārtoti neizsniegti pasūtījumi",
      reportedByUserId: "usr_demo_4",
      status: "open",
      createdAt: addDays(now, -1).toISOString(),
    },
    {
      id: "rep_3",
      targetType: "listing",
      targetId: "lst_ilzes_zupa",
      targetLabel: "Mājās vārīta dārzeņu zupa, 1 l",
      reason: "Jautājums par mājas apstākļos gatavotu ēdienu",
      reportedByUserId: "usr_demo_5",
      status: "resolved",
      createdAt: addDays(now, -6).toISOString(),
    },
  ];
}

/** Demo platform impact aggregates for the last 6 months. */
export function buildDemoImpact(now: Date = new Date()): ImpactStatistic[] {
  const rows: ImpactStatistic[] = [];
  const rand = lcg(4242);
  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
    const savedItems = Math.round(1200 + rand() * 900 + (5 - monthsAgo) * 260);
    const savedFoodKg = Math.round(savedItems * (1.4 + rand() * 0.6));
    rows.push({
      id: `imp_${monthsAgo}`,
      scope: "platform",
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      savedItems,
      savedFoodKg,
      savedMoney: Math.round(savedItems * (5.2 + rand())),
      co2AvoidedKg: Math.round(savedFoodKg * 2.5),
    });
  }
  return rows;
}
