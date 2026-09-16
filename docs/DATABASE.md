# Datu bāzes arhitektūra / Database architecture

Šis dokuments apraksta plānoto relacionālo shēmu (PostgreSQL / Supabase).
Prototipā tā ir implementēta kā mock slānis (`src/lib/store/dataStore.ts`) ar
tādiem pašiem laukiem un attiecībām, kā aprakstīts zemāk — tāpēc pāreja uz reālu
datu bāzi nozīmē tikai datu slāņa nomaiņu, nevis komponenšu pārrakstīšanu.

TypeScript tipi: `src/lib/types.ts`.

## Entītijas un attiecības

```
users 1───1 businesses            (business.owner_user_id → users.id)
users 1───1 household_sellers     (household_sellers.owner_user_id → users.id)

businesses        1───n locations         (polimorfa saite: seller_type + seller_id)
household_sellers 1───n locations

locations 1───n listings
categories 1───n listings

listings 1───n order_items
orders   1───n order_items
users    1───n orders             (orders.customer_user_id)
orders   1───1 payments           (neobligāti)

subscription_plans 1───n subscriptions
subscriptions      1───n invoices
invoices           1───n invoice_items
subscriptions      1───n payments

users 1───n favorites ───1 seller (polimorfa saite)
users 1───n reviews   ───1 orders
users 1───n notifications
users 1───n reports
```

## Tabulas

### users
| kolonna | tips | piezīmes |
|---|---|---|
| id | uuid PK | |
| role | enum(`customer`,`business`,`household`,`admin`) | |
| email | text unique | |
| password_hash | text | prototipā — plaintext demo parole |
| full_name | text | |
| phone | text null | |
| city | text null | |
| status | enum(`active`,`suspended`,`deleted`) | |
| created_at | timestamptz | |

### businesses
| kolonna | tips | piezīmes |
|---|---|---|
| id | uuid PK | |
| owner_user_id | uuid FK → users.id | |
| company_name | text | |
| registration_number | text | LV reģ. nr. (11 cipari) |
| vat_number | text null | ja ir PVN maksātājs |
| legal_address | text | |
| responsible_person | text | |
| email, phone, invoice_email | text | |
| bank_name, iban | text null | |
| category_slug | text FK → categories.slug | |
| description, logo_emoji, cover_image | text null | |
| rating, review_count | numeric / int | aprēķināti no `reviews` |
| verification_status | enum(`pending`,`approved`,`rejected`,`suspended`) | administratora lēmums |
| registry_check | jsonb | `{status, checked_at, source, note}` — sk. `src/lib/services/registryLookup.ts` |
| terms_accepted_at, food_safety_accepted_at | timestamptz null | juridiskie apliecinājumi |
| created_at | timestamptz | |

### household_sellers
Privātpersonas tiek glabātas atsevišķi no uzņēmumiem, jo tām ir citas prasības
(nav reģ. nr., citi limiti, cita atbildība). Lauki: `id`, `owner_user_id`,
`display_name`, `full_name`, `email`, `phone`, `city`, `verification_status`,
`rules_accepted_at`, `created_at`.

### locations
`id`, `seller_type` (`business`/`household`), `seller_id`, `name`, `address`,
`city`, `postal_code`, `lat`, `lng`, `opening_hours`, `is_active`.

> Polimorfā saite `seller_type + seller_id` ļauj vienam piedāvājumu modelim
> apkalpot abus pārdevēju veidus. Alternatīva reālā ieviešanā: `sellers` virstabula.

### categories
`id`, `slug` unique, `name_lv`, `name_en`, `emoji`, `is_active`, `sort_order`.

### listings
| kolonna | tips | piezīmes |
|---|---|---|
| id | uuid PK | |
| seller_type, seller_id | enum + uuid | |
| location_id | uuid FK → locations.id | |
| title, description, image | text | |
| category_slug | text FK → categories.slug | |
| original_price, discounted_price | numeric(10,2) | atlaide tiek rēķināta, netiek glabāta |
| quantity, quantity_initial | int | |
| unit | enum(`piece`,`kg`,`package`,`portion`,`liter`) | |
| estimated_weight_kg | numeric | izmanto izglābtās pārtikas statistikai |
| date_label_type | enum(`best_before`,`use_by`) | “Ieteicams līdz” / “Izlietot līdz” |
| best_before_date | timestamptz | |
| pickup_deadline | timestamptz | pēc tā piedāvājums vairs nav pieejams |
| pickup_window_start, pickup_window_end | timestamptz | |
| allergens | text[] | |
| storage_requirements | text | |
| status | enum(`draft`,`active`,`sold_out`,`expired`,`removed`,`suspended`) | |
| is_surprise_bag | boolean | |
| created_at, updated_at | timestamptz | |

Pieejamības noteikums (kods: `isListingAvailable` / `effectiveStatus`):
`status = 'active' AND quantity > 0 AND pickup_deadline > now() AND (date_label_type <> 'use_by' OR best_before_date > now())`
un pārdevēja `verification_status = 'approved'`.

### orders / order_items
`orders`: `id`, `order_number`, `pickup_code`, `customer_user_id`,
`seller_type`, `seller_id`, `location_id`, `pickup_address`,
`pickup_window_start/end`, `subtotal`, `total`, `saved_amount`, `saved_food_kg`,
`status` (`pending_payment`,`reserved`,`ready_for_pickup`,`completed`,`cancelled`,`expired`),
`payment_id`, `created_at`.

`order_items`: `id`, `order_id`, `listing_id`, `title_snapshot`, `unit_price`,
`original_unit_price`, `quantity`, `estimated_weight_kg`.
Cenas un nosaukums tiek saglabāti kā momentuzņēmums, lai vēlākas piedāvājuma
izmaiņas nemainītu vēsturisko pasūtījumu.

### payments
`id`, `order_id` null, `subscription_id` null, `amount`, `currency`, `method`
(`card`,`pay_on_pickup`), `status` (`unpaid`,`pending`,`paid`,`refunded`,`failed`),
`provider_reference` (Stripe u.c. ID — šobrīd vienmēr tukšs), `created_at`.

### subscription_plans / subscriptions
`subscription_plans`: `id`, `code` (START/GROW/PRO/…), `name_lv`, `name_en`,
`description_lv`, `description_en`, `monthly_price` **null = cena vēl nav noteikta**,
`annual_price`, `currency`, `limits` (jsonb: `active_listings`, `locations`,
`analytics`, `invoice_automation`, `priority_support`, `api_access`),
`features_lv[]`, `features_en[]`, `is_active`, `is_highlighted`, `available_for[]`,
`sort_order`.

`subscriptions`: `id`, `seller_type`, `seller_id`, `plan_id`, `status`
(`trialing`,`active`,`past_due`,`cancelled`), `interval` (`monthly`,`annual`),
`current_period_start/end`, `cancel_at_period_end`, `created_at`.

### invoices / invoice_items
`invoices`: `id`, `invoice_number`, `issue_date`, `due_date`, `subscription_id`,
`seller_type`, `seller_id`, klienta rekvizītu momentuzņēmums (`customer_name`,
`customer_registration_number`, `customer_vat_number`, `customer_legal_address`,
`customer_invoice_email`), `period_start/end`, `subtotal`, `vat_rate`,
`vat_amount`, `total`, `currency`, `status`, `paid_at`.

`invoice_items`: `id`, `invoice_id`, `description`, `quantity`, `unit_price`,
`vat_rate`, `line_total`.

> Rekvizīti tiek kopēti rēķinā tā izrakstīšanas brīdī — uzņēmuma datu izmaiņas
> nedrīkst mainīt jau izrakstītus grāmatvedības dokumentus.

### favorites, reviews, notifications, reports, impact_statistics
- `favorites`: `id`, `user_id`, `seller_type`, `seller_id`, `created_at` (unique pa lietotāju+pārdevēju).
- `reviews`: `id`, `order_id`, `user_id`, `seller_type`, `seller_id`, `rating`, `comment`, `created_at`.
- `notifications`: `id`, `user_id`, `title_lv/en`, `body_lv/en`, `read`, `link`, `created_at`.
- `reports`: `id`, `target_type` (`listing`/`user`/`business`), `target_id`, `target_label`, `reason`, `reported_by_user_id`, `status`, `created_at`.
- `impact_statistics`: `id`, `scope` (`platform`/`seller`/`user`), `scope_id`, `period_start/end`, `saved_items`, `saved_food_kg`, `saved_money`, `co2_avoided_kg` — agregāti pārskatiem.

## Konfigurācija, nevis “iecementēti” noteikumi

Juridiskās un fiskālās prasības Latvijā var mainīties un atšķiras starp
uzņēmumiem un privātpersonām, tāpēc tās glabājas konfigurācijā
(`src/lib/config.ts`), nevis komponenšu loģikā:

- `SELLER_RULES` — vai drīkst publicēt, vai vajadzīgs abonements, limiti,
  aizliegtās kategorijas, apgrozījuma griesti privātpersonām.
- `BILLING_CONFIG` — PVN likme, rēķinu numerācija, apmaksas termiņš.
- `INTEGRATIONS` — maksājumi, reģistra pārbaude, grāmatvedības eksports, kartes.
  Visi šobrīd `enabled: false`, un UI to atklāti pasaka lietotājam.

Reālā ieviešanā šīs vērtības pārceļamas uz `platform_settings` tabulu, lai
administrators tās varētu mainīt bez izvietošanas (deploy).

## Indeksi, kurus ieteicams pievienot

```sql
create index on listings (status, pickup_deadline);
create index on listings (category_slug);
create index on listings (seller_type, seller_id);
create index on locations using gist (point(lng, lat));  -- vai PostGIS geography
create index on orders (customer_user_id, created_at desc);
create index on orders (seller_id, created_at desc);
create index on invoices (seller_id, issue_date desc);
create unique index on favorites (user_id, seller_type, seller_id);
```

## Supabase piezīmes

- RLS: pircējs redz tikai savus `orders`/`favorites`; pārdevējs — savus
  `listings`, `orders`, `invoices`; administratoram atsevišķa loma.
- `listings` publiskā lasīšana atļauta tikai tad, ja izpildās pieejamības
  noteikums un pārdevējs ir `approved`.
- Piedāvājumu automātisku “izbeigšanos” var risināt ar `pg_cron` darbu, kas
  atzīmē `expired`, papildus vaicājuma līmeņa filtram.
