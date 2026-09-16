import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  { id: "cat_1", slug: "maiznicas", nameLv: "Maiznīcas", nameEn: "Bakeries", emoji: "🥐", isActive: true, sortOrder: 1 },
  { id: "cat_2", slug: "gatavie-edieni", nameLv: "Gatavie ēdieni", nameEn: "Ready meals", emoji: "🍲", isActive: true, sortOrder: 2 },
  { id: "cat_3", slug: "augli-darzeni", nameLv: "Augļi un dārzeņi", nameEn: "Fruit & vegetables", emoji: "🥕", isActive: true, sortOrder: 3 },
  { id: "cat_4", slug: "piena-produkti", nameLv: "Piena produkti", nameEn: "Dairy", emoji: "🧀", isActive: true, sortOrder: 4 },
  { id: "cat_5", slug: "konditoreja", nameLv: "Konditoreja", nameEn: "Pastry & desserts", emoji: "🍰", isActive: true, sortOrder: 5 },
  { id: "cat_6", slug: "kafejnicas", nameLv: "Kafejnīcas", nameEn: "Cafés", emoji: "☕", isActive: true, sortOrder: 6 },
  { id: "cat_7", slug: "partikas-veikali", nameLv: "Pārtikas veikali", nameEn: "Grocery stores", emoji: "🛒", isActive: true, sortOrder: 7 },
  { id: "cat_8", slug: "parsteiguma-pakas", nameLv: "Pārsteiguma pakas", nameEn: "Surprise bags", emoji: "🎁", isActive: true, sortOrder: 8 },
];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryName(slug: string, locale: "lv" | "en") {
  const c = categoryBySlug(slug);
  if (!c) return slug;
  return locale === "lv" ? c.nameLv : c.nameEn;
}

/** Gradient + emoji used instead of stock photography in the prototype. */
export const CATEGORY_VISUALS: Record<string, { from: string; to: string; emoji: string }> = {
  maiznicas: { from: "#f5d9a8", to: "#d99b57", emoji: "🥖" },
  "gatavie-edieni": { from: "#ffd6b0", to: "#e2714b", emoji: "🍛" },
  "augli-darzeni": { from: "#cfe9b0", to: "#6aa84f", emoji: "🥬" },
  "piena-produkti": { from: "#e6efff", to: "#9db8e0", emoji: "🥛" },
  konditoreja: { from: "#ffd9e6", to: "#d9749b", emoji: "🧁" },
  kafejnicas: { from: "#e5d3c2", to: "#8a5a3b", emoji: "☕" },
  "partikas-veikali": { from: "#d6f0e6", to: "#3f9c7d", emoji: "🛒" },
  "parsteiguma-pakas": { from: "#e2dcff", to: "#7a6ad8", emoji: "🎁" },
};

export function visualFor(slug: string) {
  return (
    CATEGORY_VISUALS[slug] ?? { from: "#dfeae4", to: "#7fa596", emoji: "🍽️" }
  );
}
