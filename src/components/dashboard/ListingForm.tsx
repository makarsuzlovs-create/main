"use client";

import { Camera, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Checkbox,
  FormMessage,
  SelectField,
  TextArea,
  TextField,
  Toggle,
} from "@/components/ui/Form";
import { FoodImage } from "@/components/ui/FoodImage";
import { CATEGORIES } from "@/lib/data/categories";
import type { SellerContext } from "@/lib/hooks/useSeller";
import { useI18n } from "@/lib/i18n";
import { useDataStore } from "@/lib/store/dataStore";
import type { DateLabelType, Listing, Unit } from "@/lib/types";
import { discountPercent } from "@/lib/utils";

/** EU list of declarable allergens, in Latvian. */
const ALLERGENS = [
  "Lipeklis",
  "Vēžveidīgie",
  "Olas",
  "Zivis",
  "Zemesrieksti",
  "Sojas pupas",
  "Piens",
  "Rieksti",
  "Selerijas",
  "Sinepes",
  "Sezams",
  "Sēra dioksīds",
  "Lupīna",
  "Gliemji",
];

const UNITS: { value: Unit; key: string }[] = [
  { value: "piece", key: "unitPiece" },
  { value: "kg", key: "unitKg" },
  { value: "package", key: "unitPackage" },
  { value: "portion", key: "unitPortion" },
  { value: "liter", key: "unitLiter" },
];

function toDateInput(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function toTimeInput(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function combine(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function ListingForm({
  seller,
  listing,
}: {
  seller: SellerContext;
  listing?: Listing;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const createListing = useDataStore((s) => s.createListing);
  const updateListing = useDataStore((s) => s.updateListing);

  const today = new Date();
  const defaultDate = toDateInput(today.toISOString());

  const [form, setForm] = useState({
    title: listing?.title ?? "",
    categorySlug: listing?.categorySlug ?? "maiznicas",
    description: listing?.description ?? "",
    originalPrice: listing ? String(listing.originalPrice) : "",
    discountedPrice: listing ? String(listing.discountedPrice) : "",
    quantity: listing ? String(listing.quantity) : "1",
    unit: (listing?.unit ?? "package") as Unit,
    estimatedWeightKg: listing ? String(listing.estimatedWeightKg) : "1",
    dateLabelType: (listing?.dateLabelType ?? "best_before") as DateLabelType,
    bestBeforeDate: listing ? toDateInput(listing.bestBeforeDate) : defaultDate,
    pickupDate: listing ? toDateInput(listing.pickupWindowStart) : defaultDate,
    pickupFrom: listing ? toTimeInput(listing.pickupWindowStart) : "18:00",
    pickupTo: listing ? toTimeInput(listing.pickupWindowEnd) : "20:00",
    locationId: listing?.locationId ?? seller.locations[0]?.id ?? "",
    allergens: listing?.allergens ?? [],
    storageRequirements: listing?.storageRequirements ?? "Istabas temperatūrā",
    isSurpriseBag: listing?.isSurpriseBag ?? false,
  });
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const discount = useMemo(
    () => discountPercent(Number(form.originalPrice), Number(form.discountedPrice)),
    [form.originalPrice, form.discountedPrice],
  );

  const restricted = seller.rules.restrictedCategories.includes(form.categorySlug);
  const limitReached =
    !listing &&
    seller.limits.maxListings !== null &&
    seller.activeListings.length >= seller.limits.maxListings;

  const submit = (status: Listing["status"]) => {
    setError(null);
    if (!form.title.trim() || !form.description.trim() || !form.locationId) {
      setError(t("listingForm.errorRequired"));
      return;
    }
    const original = Number(form.originalPrice);
    const discounted = Number(form.discountedPrice);
    if (!original || !discounted || discounted >= original) {
      setError(t("listingForm.errorPrice"));
      return;
    }
    if (restricted) {
      setError(t("listingForm.errorCategoryRestricted"));
      return;
    }
    if (limitReached && status === "active") {
      setError(
        t("dashboard.listingLimitReached", { limit: String(seller.limits.maxListings) }),
      );
      return;
    }

    const payload = {
      sellerType: seller.sellerType,
      sellerId: seller.sellerId,
      locationId: form.locationId,
      title: form.title.trim(),
      categorySlug: form.categorySlug,
      description: form.description.trim(),
      originalPrice: original,
      discountedPrice: discounted,
      quantity: Number(form.quantity) || 1,
      unit: form.unit,
      estimatedWeightKg: Number(form.estimatedWeightKg) || 0.5,
      dateLabelType: form.dateLabelType,
      bestBeforeDate: combine(form.bestBeforeDate, "23:59"),
      pickupWindowStart: combine(form.pickupDate, form.pickupFrom),
      pickupWindowEnd: combine(form.pickupDate, form.pickupTo),
      allergens: form.allergens,
      storageRequirements: form.storageRequirements,
      isSurpriseBag: form.isSurpriseBag,
      status,
    };

    if (listing) {
      updateListing(listing.id, {
        ...payload,
        pickupDeadline: payload.pickupWindowEnd,
        quantityInitial: Math.max(listing.quantityInitial, payload.quantity),
      });
    } else {
      createListing(payload);
    }
    router.push("/biznesa-panelis/piedavajumi");
  };

  return (
    <form
      className="grid gap-5 lg:grid-cols-[1.6fr_1fr]"
      onSubmit={(e) => {
        e.preventDefault();
        submit("active");
      }}
    >
      <div className="space-y-5">
        <section className="card space-y-4 p-5">
          <TextField
            label={t("listingForm.name")}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Rīta maiznīcas paka"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label={t("listingForm.category")}
              value={form.categorySlug}
              onChange={(e) => update("categorySlug", e.target.value)}
              error={restricted ? t("listingForm.errorCategoryRestricted") : undefined}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.emoji} {c.nameLv}
                </option>
              ))}
            </SelectField>
            <SelectField
              label={t("listingForm.location")}
              value={form.locationId}
              onChange={(e) => update("locationId", e.target.value)}
              required
            >
              {seller.locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.address}
                </option>
              ))}
            </SelectField>
          </div>
          <TextArea
            label={t("listingForm.description")}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Kas ir paciņā, cik daudz un kāpēc tā ir pieejama lētāk?"
            required
          />
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-4">
            <Camera size={18} className="text-ink-600" />
            <div>
              <p className="text-sm font-bold text-ink-800">{t("listingForm.photo")}</p>
              <p className="text-xs text-ink-600">{t("listingForm.photoHint")}</p>
            </div>
          </div>
          <Toggle
            checked={form.isSurpriseBag}
            onChange={(v) => update("isSurpriseBag", v)}
            label={t("listingForm.surpriseBag")}
          />
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
            {t("listingForm.discount")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label={t("listingForm.originalPrice")}
              type="number"
              step="0.01"
              min="0"
              value={form.originalPrice}
              onChange={(e) => update("originalPrice", e.target.value)}
              required
            />
            <TextField
              label={t("listingForm.discountedPrice")}
              type="number"
              step="0.01"
              min="0"
              value={form.discountedPrice}
              onChange={(e) => update("discountedPrice", e.target.value)}
              required
            />
            <div>
              <label className="label">{t("listingForm.discount")}</label>
              <div className="flex h-[46px] items-center justify-center rounded-xl bg-clay-500 text-lg font-extrabold text-white">
                {discount > 0 ? `-${discount}%` : "—"}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label={t("listingForm.quantity")}
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              required
            />
            <SelectField
              label={t("listingForm.unit")}
              value={form.unit}
              onChange={(e) => update("unit", e.target.value as Unit)}
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {t(`listingForm.${u.key}`)}
                </option>
              ))}
            </SelectField>
            <TextField
              label={t("listingForm.weight")}
              hint={t("listingForm.weightHint")}
              type="number"
              step="0.1"
              min="0"
              value={form.estimatedWeightKg}
              onChange={(e) => update("estimatedWeightKg", e.target.value)}
            />
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
            {t("listingForm.dateType")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label={t("listingForm.dateType")}
              hint={t("listingForm.dateTypeHint")}
              value={form.dateLabelType}
              onChange={(e) => update("dateLabelType", e.target.value as DateLabelType)}
            >
              <option value="best_before">{t("listingForm.bestBefore")}</option>
              <option value="use_by">{t("listingForm.useBy")}</option>
            </SelectField>
            <TextField
              label={t("listingForm.date")}
              type="date"
              value={form.bestBeforeDate}
              onChange={(e) => update("bestBeforeDate", e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label={t("listingForm.pickupWindow")}
              type="date"
              value={form.pickupDate}
              onChange={(e) => update("pickupDate", e.target.value)}
              required
            />
            <TextField
              label={t("common.from")}
              type="time"
              value={form.pickupFrom}
              onChange={(e) => update("pickupFrom", e.target.value)}
              required
            />
            <TextField
              label={t("common.to")}
              type="time"
              value={form.pickupTo}
              onChange={(e) => update("pickupTo", e.target.value)}
              required
            />
          </div>
          <p className="flex items-start gap-2 rounded-xl bg-sand-50 px-3.5 py-2.5 text-xs text-ink-600">
            <Info size={14} className="mt-0.5 shrink-0 text-brand-600" />
            {t("listingForm.dateTypeHint")}
          </p>
        </section>

        <section className="card space-y-4 p-5">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
              {t("listingForm.allergens")}
            </h2>
            <p className="text-xs text-ink-600">{t("listingForm.allergensHint")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ALLERGENS.map((allergen) => (
              <Checkbox
                key={allergen}
                label={allergen}
                checked={form.allergens.includes(allergen)}
                onChange={(checked) =>
                  update(
                    "allergens",
                    checked
                      ? [...form.allergens, allergen]
                      : form.allergens.filter((a) => a !== allergen),
                  )
                }
              />
            ))}
          </div>
          <TextField
            label={t("listingForm.storage")}
            value={form.storageRequirements}
            onChange={(e) => update("storageRequirements", e.target.value)}
          />
        </section>
      </div>

      {/* Preview + actions */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:h-max">
        <div className="card overflow-hidden">
          <div className="h-36">
            <FoodImage
              categorySlug={form.categorySlug}
              alt={form.title || t("listingForm.preview")}
              emojiClassName="text-5xl"
            />
          </div>
          <div className="space-y-2 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-600">
              {t("listingForm.preview")}
            </p>
            <p className="text-base font-extrabold text-ink-900">
              {form.title || "—"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-brand-700">
                €{form.discountedPrice || "0.00"}
              </span>
              {form.originalPrice && (
                <span className="text-sm text-ink-600 line-through">€{form.originalPrice}</span>
              )}
              {discount > 0 && (
                <span className="ml-auto rounded-full bg-clay-500 px-2 py-0.5 text-xs font-extrabold text-white">
                  -{discount}%
                </span>
              )}
            </div>
            <p className="text-xs text-ink-600">
              {form.pickupDate} · {form.pickupFrom}–{form.pickupTo}
            </p>
            <p className="text-xs font-bold text-ink-700">
              {form.dateLabelType === "use_by"
                ? t("listingForm.useBy")
                : t("listingForm.bestBefore")}
              : {form.bestBeforeDate}
            </p>
          </div>
        </div>

        {limitReached && (
          <FormMessage tone="info">
            {t("dashboard.listingLimitReached", { limit: String(seller.limits.maxListings) })}
          </FormMessage>
        )}
        {error && <FormMessage tone="error">{error}</FormMessage>}

        <div className="space-y-2">
          <Button type="submit" size="lg" fullWidth>
            {listing ? t("listingForm.update") : t("listingForm.publish")}
          </Button>
          {!listing && (
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => submit("draft")}
            >
              {t("listingForm.saveDraft")}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => router.push("/biznesa-panelis/piedavajumi")}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </aside>
    </form>
  );
}
