# Derīgs — pārtikas glābšanas tirgus laukums (prototips)

Latvijas tirgus laukums nepārdotai pārtikai: veikali, maiznīcas, kafejnīcas,
restorāni, viesnīcas, ražotāji un mājsaimniecības piedāvā pārpalikumus par zemāku
cenu, nevis izmet tos.

> **Prototips.** Visi uzņēmumi, produkti, cilvēki, rēķini un statistika ir
> izdomāti demonstrācijas dati. Neviens reāls uzņēmums šajā pakalpojumā
> nepiedalās.

## Saturs

- [Ātrais starts](#ātrais-starts)
- [Demo konti](#demo-konti)
- [Ko var izdarīt](#ko-var-izdarīt)
- [Kas apzināti NAV ieviests](#kas-apzināti-nav-ieviests)
- [Tehniskais risinājums](#tehniskais-risinājums)
- [Projekta struktūra](#projekta-struktūra)
- [Konfigurācija](#konfigurācija)

## Ātrais starts

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

Saskarne ir latviešu valodā, ar pārslēgu **LV / EN** galvenē (izvēle tiek
saglabāta pārlūkā).

## Demo konti

Parole visiem: `demo1234`. Pieteikšanās lapā tos var izvēlēties ar vienu klikšķi.

| Loma | E-pasts | Kur nonāk |
|---|---|---|
| Pircējs | `pircejs@demo.lv` | sākumlapa, pasūtījumi, favorīti |
| Uzņēmums | `maiznica@demo.lv` | `/biznesa-panelis` |
| Privātpersona | `majsaimnieciba@demo.lv` | `/biznesa-panelis` (vienkāršoti limiti) |
| Administrators | `admin@demo.lv` | `/admin` |

## Ko var izdarīt

**Pircējs** — pārlūkot bez konta, izvēlēties vietu, meklēt un filtrēt, skatīt
piedāvājumus sarakstā un kartē, atvērt produkta lapu (cena, atlaide, atlikums,
alergēni, “Ieteicams līdz” / “Izlietot līdz”, saņemšanas adrese un laiks),
pievienot grozam, noformēt rezervāciju (pirms tam jāpieslēdzas), saņemt
pasūtījuma numuru un saņemšanas kodu, redzēt pasūtījumu vēsturi, saglabāt
pārdevējus un savu ietekmes statistiku.

**Uzņēmums** — detalizēta reģistrācija (nosaukums, reģ. nr., PVN nr., juridiskā
un faktiskā adrese, atbildīgā persona, rēķinu e-pasts, bankas dati, noteikumu un
pārtikas drošības apliecinājums), panelis ar KPI un grafikiem, piedāvājumu
izveide/rediģēšana/noņemšana un atzīmēšana kā izpārdotiem, pasūtījumi ar
saņemšanas kodiem, statistika, lokācijas, abonements, rēķini (skatīt, drukāt/PDF,
atzīmēt apmaksātu), uzņēmuma dati un iestatījumi.

**Privātpersona** — vienkāršota reģistrācija un tas pats pārdevēja panelis ar
citiem noteikumiem (limitēts aktīvo piedāvājumu skaits, viena vieta, dažas
kategorijas nav pieejamas, nav abonementa maksas).

**Administrators** — pārskats ar platformas KPI, pārdevēju verifikācija (Gaida
pārbaudi / Apstiprināts / Noraidīts / Apturēts), lietotāji, piedāvājumu
apturēšana, pasūtījumi, abonementi **un plānu cenu konfigurēšana**, rēķini,
kategorijas, sūdzību izskatīšana.

Pārbaudīta pilna ķēde: uzņēmuma reģistrācija → piedāvājuma izveide → administratora
apstiprinājums → piedāvājums parādās publiski → pircējs rezervē → pasūtījums
parādās pārdevēja panelī.

## Kas apzināti NAV ieviests

Prototips nekur neizliekas, ka šīs lietas darbojas:

| Joma | Statuss |
|---|---|
| Maksājumi (Stripe u.c.) | Nav pieslēgti. Pasūtījums ir rezervācija; nauda netiek ieturēta. |
| Reģistra pārbaude (UR / VID) | Nav pieslēgta. `registryCheck.status = "not_checked"`, datus pārbauda administrators. Vieta integrācijai: `src/lib/services/registryLookup.ts`. |
| Rēķinu iesniegšana VID | Nenotiek. Rēķins ir demonstrācijas dokuments, ko var izdrukāt / saglabāt PDF. |
| E-pasta sūtīšana | Nenotiek; poga parāda paziņojumu, ka tas ir demo. |
| Karšu pakalpojums | Vienkāršota vizualizācija bez ārējas SDK; datu forma (pins) jau atbilst reālai integrācijai. |
| Attēlu augšupielāde | Tiek rādīti kategoriju vizuāļi; `listing.image` lauks jau pastāv. |

## Tehniskais risinājums

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, `recharts` grafikiem,
  `lucide-react` ikonām, `zustand` stāvoklim.
- **Mock backend** — `src/lib/store/dataStore.ts` ar `localStorage` noturību.
  Tas atdarina serverī gaidāmo API (autentifikācija, piedāvājumu CRUD, pasūtījumu
  izveide ar atlikumu samazināšanu, abonementi, rēķinu ģenerēšana, verifikācija).
  Shēma un attiecības: [`docs/DATABASE.md`](docs/DATABASE.md).
- **Divvalodība** — `src/lib/i18n/dictionaries.ts` (LV/EN) un `useI18n()`.
- Demo dati tiek ģenerēti relatīvi pret šodienas datumu un reizi dienā
  atsvaidzināti, lai vienmēr būtu aktuāli piedāvājumi; lietotāja izveidotie dati
  tiek saglabāti.
- Mobile-first: apakšējā navigācija pircējam (Sākums, Meklēt, Karte, Pasūtījumi,
  Profils) un pārdevējam (Pārskats, Piedāvājumi, +, Pasūtījumi, Profils).

## Projekta struktūra

```
src/
  app/                     maršruti (App Router)
    piedavajumi/ karte/    pārlūkošana (saraksts + karte)
    produkts/[id]/         produkta lapa
    grozs/ checkout/       grozs un pasūtījuma noformēšana
    pasutijums/[id]/       apstiprinājums ar saņemšanas kodu
    registreties/          pircējs / uzņēmums / privātpersona
    biznesa-panelis/       pārdevēja panelis (10 sadaļas)
    admin/                 administrācija (9 sadaļas)
    cenas/ ietekme/ par-mums/ noteikumi/
  components/              layout, marketplace, dashboard, admin, ui
  lib/
    types.ts               domēna modelis (atbilst DB shēmai)
    config.ts              noteikumi, PVN, integrāciju karodziņi
    data/                  demo dati (izdomāti Latvijas pārdevēji)
    store/                 mock backend + sesija/grozs
    hooks/ stats.ts utils.ts i18n/ services/
docs/DATABASE.md           datu bāzes arhitektūra
```

## Konfigurācija

Nekas juridisks nav iekodēts komponentēs — to maina `src/lib/config.ts`:

- `SELLER_RULES` — atsevišķi noteikumi uzņēmumiem un privātpersonām
  (publicēšana, abonements, limiti, aizliegtās kategorijas, apgrozījuma griesti).
- `BILLING_CONFIG` — PVN likme, rēķinu prefikss un apmaksas termiņš.
- `INTEGRATIONS` — maksājumu, reģistra, grāmatvedības un karšu karodziņi.
- Abonementu cenas nav noteiktas: `monthlyPrice: null` → publiskajā lapā redzams
  `€XX / mēnesī`, līdz administrators sadaļā **Admin → Abonementi** ievada cenu.
