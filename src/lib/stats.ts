import type { Order } from "./types";
import { addDays, isSameDay } from "./utils";

export interface DailyPoint {
  date: string;
  label: string;
  orders: number;
  revenue: number;
  foodKg: number;
  items: number;
}

/** Aggregates orders into a per-day series for dashboard charts. */
export function buildDailySeries(orders: Order[], days = 30, now = new Date()): DailyPoint[] {
  const points: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = addDays(now, -i);
    const dayOrders = orders.filter(
      (o) => o.status !== "cancelled" && isSameDay(new Date(o.createdAt), day),
    );
    points.push({
      date: day.toISOString(),
      label: `${day.getDate()}.${day.getMonth() + 1}.`,
      orders: dayOrders.length,
      revenue: +dayOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2),
      foodKg: +dayOrders.reduce((sum, o) => sum + o.savedFoodKg, 0).toFixed(1),
      items: dayOrders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
        0,
      ),
    });
  }
  return points;
}

export function totals(orders: Order[]) {
  const valid = orders.filter((o) => o.status !== "cancelled");
  return {
    orders: valid.length,
    revenue: +valid.reduce((sum, o) => sum + o.total, 0).toFixed(2),
    foodKg: +valid.reduce((sum, o) => sum + o.savedFoodKg, 0).toFixed(1),
    items: valid.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0),
    savedMoney: +valid.reduce((sum, o) => sum + o.savedAmount, 0).toFixed(2),
  };
}

export function ordersToday(orders: Order[], now = new Date()) {
  return orders.filter(
    (o) => o.status !== "cancelled" && isSameDay(new Date(o.createdAt), now),
  );
}

export function ordersWithinDays(orders: Order[], days: number, now = new Date()) {
  const cutoff = addDays(now, -days).getTime();
  return orders.filter(
    (o) => o.status !== "cancelled" && new Date(o.createdAt).getTime() >= cutoff,
  );
}
