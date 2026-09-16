"use client";

import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { locale } = useI18n();
  const lv = locale === "lv";

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold text-ink-900">
        {lv ? "Lietošanas noteikumi" : "Terms of use"}
      </h1>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        {lv
          ? "Šis ir prototips. Zemāk esošais teksts ir vietturis, nevis juridiski pārbaudīti noteikumi. Pirms reālas darbības uzsākšanas noteikumi jāsagatavo kopā ar juristu."
          : "This is a prototype. The text below is a placeholder, not legally reviewed terms. Real terms must be drafted with a lawyer before launch."}
      </div>

      <Section title={lv ? "1. Pakalpojums" : "1. The service"}>
        {lv
          ? "Derīgs ir tirgus laukums, kurā pārdevēji (uzņēmumi un privātpersonas) piedāvā pārtiku, kas citādi netiktu pārdota. Platforma nodrošina tehnisko risinājumu un nav pārtikas pārdevējs vai ražotājs."
          : "Derīgs is a marketplace where sellers (businesses and private individuals) offer food that would otherwise go unsold. The platform provides the technical service and is not the seller or producer of the food."}
      </Section>

      <Section title={lv ? "2. Pārdevēja atbildība" : "2. Seller responsibility"}>
        {lv
          ? "Pārdevējs ir atbildīgs par piedāvātās pārtikas drošību, kvalitāti, marķējumu, alergēnu informāciju un termiņu norādīšanu, kā arī par attiecīgo normatīvo aktu ievērošanu."
          : "The seller is responsible for the safety, quality, labelling, allergen information and date marking of the food offered, and for complying with the applicable regulations."}
      </Section>

      <Section title={lv ? "3. Abonements un norēķini" : "3. Subscription and billing"}>
        {lv
          ? "Pārdevēji, kas publicē piedāvājumus, var maksāt abonementa maksu. Gala cenas vēl tiek noteiktas. Par abonementu tiek izrakstīts rēķins ar uzņēmuma rekvizītiem. Rēķins netiek automātiski iesniegts VID un neaizstāj grāmatvedības sistēmu."
          : "Sellers who publish listings may pay a subscription fee. Final prices are still being decided. An invoice with the company details is issued for the subscription. The invoice is not submitted to the tax authority automatically and does not replace an accounting system."}
      </Section>

      <Section title={lv ? "4. Maksājumi" : "4. Payments"}>
        {lv
          ? "Šajā prototipā maksājumu pakalpojumu sniedzējs nav pieslēgts. Pasūtījumi tiek veidoti kā rezervācijas, un norēķini notiek klātienē saņemšanas brīdī."
          : "No payment provider is connected in this prototype. Orders are created as reservations and are settled in person at pickup."}
      </Section>

      <Section id="privatums" title={lv ? "5. Privātuma politika" : "5. Privacy policy"}>
        {lv
          ? "Prototipā dati tiek glabāti tikai tavā pārlūkprogrammā (localStorage) un netiek sūtīti uz serveri. Reālā versijā būtu jāapraksta datu apstrādes mērķi, glabāšanas termiņi un lietotāja tiesības atbilstoši VDAR."
          : "In the prototype, data is stored only in your browser (localStorage) and is never sent to a server. A production version would describe processing purposes, retention periods and user rights under the GDPR."}
      </Section>

      <Section id="partikas-drosiba" title={lv ? "6. Pārtikas drošība" : "6. Food safety"}>
        {lv
          ? "Produkti ar norādi “Izlietot līdz” tiek automātiski noņemti no pārdošanas, kad datums ir sasniegts, un platforma nekad neiesaka tos lietot uzturā pēc šī datuma. Produktiem ar norādi “Ieteicams līdz” pēc datuma var mainīties garša vai tekstūra — pircējam vienmēr jānovērtē produkts pašam."
          : "Products marked “use by” are automatically removed from sale once the date is reached, and the platform never suggests eating them after that date. Products marked “best before” may change in taste or texture after the date — the buyer should always assess the product themselves."}
      </Section>

      <Section title={lv ? "7. Kontakti" : "7. Contact"}>
        {lv
          ? "Prototipa demonstrācijai: info@derigs.lv (fiktīva adrese)."
          : "For prototype demonstration purposes: info@derigs.lv (fictional address)."}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mt-8 scroll-mt-24">
      <h2 className="text-lg font-extrabold text-ink-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">{children}</p>
    </section>
  );
}
