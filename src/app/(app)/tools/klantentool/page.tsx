"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, Mail, RotateCcw, Copy, Check, BookOpen, X, Plus } from "lucide-react";

const WINKELS   = ["Gemert", "Deurne", "Asten", "Geldrop", "Veghel"];
const PROVIDERS = ["KPN", "ODIDO", "Vodafone", "Ben", "Lebara", "Youfone"];
const LOG_KEY   = "tc_logboek_items";

const AFSPRAAK_LINKS: Record<string, string> = {
  Gemert: "https://www.telecombinatie.nl/winkel/telecombinatie-gemert",
  Deurne: "https://www.telecombinatie.nl/winkel/telecombinatie-deurne",
  Veghel: "https://www.telecombinatie.nl/winkel/telecombinatie-veghel",
  Asten:  "https://www.telecombinatie.nl/winkel/telecombinatie-asten",
  Geldrop:"https://www.telecombinatie.nl/winkel/telecombinatie-geldrop",
};
const REVIEW_LINKS: Record<string, string> = {
  Asten:  "https://g.page/r/CURm00IjirDXEBM/review",
  Deurne: "https://g.page/r/CetpTsljJPjCEBM/review",
  Veghel: "https://g.page/r/CekhPGtFQjilEBM/review",
  Geldrop:"https://g.page/r/CQio7npElrOfEBM/review",
  Gemert: "https://g.page/r/Cap3N_FjHkxWEBM/review",
};

// ── helpers ──────────────────────────────────────────────────────────────────
function normPhone(v: string) { return (v || "").replace(/\D/g, ""); }
function formatPhone(t: string) {
  t = normPhone(t);
  if (t.startsWith("06") && t.length === 10) return "31" + t.substring(1);
  if (t.startsWith("316") && t.length === 11) return t;
  if (t.startsWith("0031")) return t.substring(2);
  return t;
}
function validPhone(n: string) { return /^\d{8,15}$/.test(n); }
function validEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || "").trim()); }
function parseAmount(v: string): number | null {
  let s = (v || "").trim().replace(/\s/g, "").replace(/€/g, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function fmtEuro(v: string | number | null) {
  if (v === null || v === undefined || v === "") return "€ -";
  const n = typeof v === "number" ? v : parseAmount(String(v));
  if (n !== null) return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
  const s = String(v).trim();
  return s.startsWith("€") ? s : `€ ${s}`;
}
function getAanhef(naam: string) { return naam ? `Hoi ${naam}` : "Beste klant,"; }
function afsluiting(door: string, winkel: string) {
  const n = door.trim(), w = winkel.trim();
  if (n) return w ? `${n} Telecombinatie ${w}` : `${n} Telecombinatie`;
  return w ? `Team Telecombinatie ${w}` : "Team Telecombinatie";
}

interface LogItem { date: string; phone: string; messageType: string; location: string; }
function getLogs(): LogItem[] {
  try { const r = localStorage.getItem(LOG_KEY); return Array.isArray(JSON.parse(r || "[]")) ? JSON.parse(r!) : []; } catch { return []; }
}
function saveLogs(items: LogItem[]) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(items)); } catch { /**/ }
}
function addLog(phone: string, messageType: string, location: string) {
  if (!phone.trim()) return;
  const now = new Date();
  const p = (v: number) => String(v).padStart(2, "0");
  const date = `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
  const items = getLogs();
  items.unshift({ date, phone: phone.trim(), messageType: messageType || "-", location: location || "-" });
  saveLogs(items);
}
function todayStr() {
  const now = new Date();
  const p = (v: number) => String(v).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}`;
}
function countTodayDuplicates(phone: string) {
  const norm = normPhone(phone);
  if (norm.length < 8) return 0;
  return getLogs().filter(i => normPhone(i.phone) === norm && String(i.date).slice(0, 10) === todayStr()).length;
}

interface ExtraNummer {
  id: number;
  telefoon: string;
  huidigeGB: string; huidigeMinuten: string; huidigeKosten: string; onbeperkt: boolean;
  nieuweGB: string; nieuweMinuten: string; nieuweKosten: string; nieuwOnbeperkt: boolean; zelfde: boolean;
}

type Tab = "abonnement" | "overige";

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] bg-white";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

function BtnWA({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"><MessageCircle size={13} />WhatsApp</button>;
}
function BtnMail({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"><Mail size={13} />E-mail</button>;
}
function BtnReset({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex items-center gap-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 text-xs font-bold px-3 py-2 rounded-lg transition-colors"><RotateCcw size={12} />Reset</button>;
}

function DupWarn({ phone }: { phone: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const n = normPhone(phone);
    if (n.length >= 8) setCount(countTodayDuplicates(phone));
    else setCount(0);
  }, [phone]);
  if (!count) return null;
  return <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 mt-1">⚠️ Dit nummer is vandaag al {count}× gebruikt.</p>;
}

export default function KlantentoolPage() {
  const [tab, setTab] = useState<Tab>("abonnement");
  const [winkel, setWinkel] = useState("");
  const [preview, setPreview] = useState("");
  const [lastPhone, setLastPhone] = useState("");
  const [lastEmail, setLastEmail] = useState("");
  const [lastOnderwerp, setLastOnderwerp] = useState("Bericht van Telecombinatie");
  const [showLog, setShowLog] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [copied, setCopied] = useState(false);

  // Abonnement form
  const [aNaam, setANaam] = useState("");
  const [aTel, setATel] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aProvider, setAProvider] = useState("");
  const [aType, setAType] = useState("voorstel3gg");
  const [aHGB, setAHGB] = useState(""); const [aHMin, setAHMin] = useState(""); const [aHKost, setAHKost] = useState(""); const [aHOnbep, setAHOnbep] = useState(false);
  const [aNGB, setANGB] = useState(""); const [aNMin, setANMin] = useState(""); const [aNKost, setANKost] = useState(""); const [aNOnbep, setANOnbep] = useState(false);
  const [aDuur, setADuur] = useState("24"); const [aZelfde, setAZelfde] = useState(false);
  const [aGeholpen, setAGeholpen] = useState("");
  const [extra, setExtra] = useState<ExtraNummer[]>([]);

  // Bestelling form
  const [bNaam, setBNaam] = useState(""); const [bTel, setBTel] = useState(""); const [bEmail, setBEmail] = useState(""); const [bProduct, setBProduct] = useState("");

  // Review form
  const [rNaam, setRNaam] = useState(""); const [rTel, setRTel] = useState(""); const [rEmail, setREmail] = useState(""); const [rGeholpen, setRGeholpen] = useState("");

  // Uitnodiging form
  const [uNaam, setUNaam] = useState(""); const [uTel, setUTel] = useState(""); const [uEmail, setUEmail] = useState(""); const [uType, setUType] = useState("uitnodiging");

  // Verzekering form
  const [vNaam, setVNaam] = useState(""); const [vTel, setVTel] = useState(""); const [vEmail, setVEmail] = useState(""); const [vAdres, setVAdres] = useState(""); const [vPolis, setVPolis] = useState(""); const [vIMEI, setVIMEI] = useState("");

  // Retentie
  const [retNaam, setRetNaam] = useState("");
  // retentieTelefoon synced from aTel
  useEffect(() => {
    try { const n = localStorage.getItem("tc_retentie_naam"); if (n) setRetNaam(n); } catch { /**/ }
  }, []);
  useEffect(() => { try { localStorage.setItem("tc_retentie_naam", retNaam); } catch { /**/ } }, [retNaam]);

  // Message builders
  function contractDuurTekst() { return aDuur === "1" ? "1 maand" : `${aDuur} maanden`; }
  function bundel(gb: string, min: string, onbep: boolean) { return `${gb || "-"} + ${onbep ? "onbeperkt bellen" : (min || "belminuten")}`; }

  const buildAbonnementTekst = useCallback(() => {
    const naam = aNaam.trim();
    const aanhef = getAanhef(naam);
    const prov = aProvider;
    const winkelT = winkel;
    const door = aGeholpen.trim();

    if (aType === "voorstel3gg") {
      const afsluitT = afsluiting(door, winkelT);
      const afspraakL = winkelT ? (AFSPRAAK_LINKS[winkelT] || "") : "";
      const winkelZin = winkelT ? `Liever even langskomen in de winkel? Je bent van harte welkom, of maak alvast een afspraak via:\n${afspraakL}` : `Liever even langskomen in de winkel? Je bent van harte welkom.`;
      let t = `${aanhef}\n\nWe probeerden je laatst even te bellen over je mobiele ${prov ? `${prov} ` : ""}abonnement dat binnenkort afloopt. Daarom stuur ik je even een berichtje. We hebben een mooi voorstel voor je klaarstaan:\n\n`;
      const hoofdBlok = aZelfde
        ? `Je huidige bundel: ${bundel(aHGB, aHMin, aHOnbep)}\nHuidige prijs: ${fmtEuro(aHKost)} p/m\n\nDeze kunnen wij weer verlengen naar ${fmtEuro(aNKost)} p/m\nDit contract is weer voor ${contractDuurTekst()}`
        : `Je huidige bundel: ${bundel(aHGB, aHMin, aHOnbep)}\nHuidige prijs: ${fmtEuro(aHKost)} p/m\n\nNieuwe bundel: ${bundel(aNGB, aNMin, aNOnbep)}\nNieuwe prijs: ${fmtEuro(aNKost)} p/m\nDit contract is weer voor ${contractDuurTekst()}`;
      t += hoofdBlok;
      for (const e of extra) {
        if (!e.telefoon && !e.huidigeGB && !e.nieuweGB) continue;
        t += `\n\nExtra nummer onder uw naam: ${e.telefoon || "-"}\nJe huidige bundel: ${bundel(e.huidigeGB, e.huidigeMinuten, e.onbeperkt)}\nHuidige prijs: ${fmtEuro(e.huidigeKosten)} p/m\n\n${e.zelfde ? `Deze kunnen wij weer verlengen naar ${fmtEuro(e.nieuweKosten)} p/m` : `Nieuwe bundel: ${bundel(e.nieuweGB, e.nieuweMinuten, e.nieuwOnbeperkt)}\nNieuwe prijs: ${fmtEuro(e.nieuweKosten)} p/m`}\nDit contract is weer voor ${contractDuurTekst()}`;
      }
      return `${t}\n\nIs dit oke voor je? Stuur gerust 'akkoord' op dit bericht, dan regelen wij de verlenging meteen voor je.\n\n${winkelZin}\n\nMet vriendelijke groet,\n${afsluitT}`.trim();
    }

    const intro = aType === "contact"
      ? `${aanhef}\n\nFijn dat wij zojuist contact hebben gehad over uw ${prov} abonnement. Zoals besproken sturen wij u hierbij alvast het voorstel voor verlenging.`
      : `${aanhef}\n\nUw abonnement, dat bij ons is afgesloten, is al enige tijd verlengbaar. Op basis van uw huidige gebruik kunnen wij uw abonnement verlengen met een nieuw aanbod dat beter bij u past.`;

    const heeftExtra = extra.some(e => e.telefoon || e.huidigeGB || e.nieuweGB);
    const hoofdNummerBlok = aZelfde
      ? `${heeftExtra ? `Uw eigen mobiele nummer: ${aTel || "-"}\n\n` : ""}Uw huidige bundel is ${bundel(aHGB, aHMin, aHOnbep)}\nHiervoor betaalt u momenteel ${fmtEuro(aHKost)} per maand.\n\nWij kunnen hetzelfde abonnement opnieuw verlengen voor ${fmtEuro(aNKost)} per maand.\nDit contract is weer voor ${contractDuurTekst()}.`
      : `${heeftExtra ? `Uw eigen mobiele nummer: ${aTel || "-"}\n\n` : ""}Uw huidige bundel is ${bundel(aHGB, aHMin, aHOnbep)}\nHiervoor betaalt u momenteel ${fmtEuro(aHKost)} per maand.\n\nWij kunnen dit verlengen naar ${bundel(aNGB, aNMin, aNOnbep)}\nDe nieuwe maandprijs wordt dan ${fmtEuro(aNKost)} per maand.\nDit contract is weer voor ${contractDuurTekst()}.`;

    let t = `${intro}\n\n${hoofdNummerBlok}`;
    let curTot: number | null = parseAmount(aHKost);
    let newTot: number | null = parseAmount(aNKost);
    let allKnown = curTot !== null && newTot !== null;

    extra.filter(e => e.telefoon || e.huidigeGB || e.nieuweGB).forEach((e, idx) => {
      const blok = e.zelfde
        ? `Extra nummer ${idx+1} onder uw naam: ${e.telefoon || "-"}\n\nDeze bundel is ${bundel(e.huidigeGB, e.huidigeMinuten, e.onbeperkt)}\nHiervoor betaalt u momenteel ${fmtEuro(e.huidigeKosten)} per maand.\n\nWij kunnen hetzelfde abonnement opnieuw verlengen voor ${fmtEuro(e.nieuweKosten)} per maand.\nDit contract is weer voor ${contractDuurTekst()}.`
        : `Extra nummer ${idx+1} onder uw naam: ${e.telefoon || "-"}\n\nDeze bundel is ${bundel(e.huidigeGB, e.huidigeMinuten, e.onbeperkt)}\nHiervoor betaalt u momenteel ${fmtEuro(e.huidigeKosten)} per maand.\n\nWij kunnen dit verlengen naar ${bundel(e.nieuweGB, e.nieuweMinuten, e.nieuwOnbeperkt)}\nDe nieuwe maandprijs wordt dan ${fmtEuro(e.nieuweKosten)} per maand.\nDit contract is weer voor ${contractDuurTekst()}.`;
      t += `\n\n${blok}`;
      const ec = parseAmount(e.huidigeKosten), en = parseAmount(e.nieuweKosten);
      if (ec === null || en === null) allKnown = false;
      if (ec !== null) curTot = (curTot || 0) + ec;
      if (en !== null) newTot = (newTot || 0) + en;
    });

    if (heeftExtra) {
      const diff = allKnown && curTot !== null && newTot !== null ? curTot - newTot : null;
      const verschil = diff === null ? "Vul alle bedragen in om de totale besparing per maand te berekenen."
        : diff > 0 ? `Totale besparing per maand: ${fmtEuro(diff)}`
        : diff < 0 ? `Totale meerprijs per maand: ${fmtEuro(Math.abs(diff))}` : `Totaal verschil per maand: ${fmtEuro(0)}`;
      t += `\n\nOverzicht van alle nummers\n\nTotale huidige maandkosten: ${curTot !== null ? fmtEuro(curTot) : "€ -"}\nTotale nieuwe maandkosten: ${newTot !== null ? fmtEuro(newTot) : "€ -"}\n${verschil}`;
    }

    const slot = aType === "contact"
      ? `\n\nIndien u akkoord bent met dit voorstel, kunt u eenvoudig reageren op dit bericht. Zodra wij uw akkoord ontvangen, kunnen wij de verlenging direct voor u in orde maken.\n\nMet vriendelijke groet,\n\n${afsluiting(door, winkelT)}`
      : `\n\nIndien u akkoord bent met dit voorstel, kunt u eenvoudig reageren op dit bericht. Zodra wij uw akkoord ontvangen, kunnen wij de verlenging direct voor u in orde maken.\n\nU bent natuurlijk ook van harte welkom in onze winkel in ${winkelT}.\n\nWilt u liever een moment plannen op een tijdstip dat u goed uitkomt? Dat kan eenvoudig via onderstaande link.\n${AFSPRAAK_LINKS[winkelT] || ""}\n\nMet vriendelijke groet,\n\n${afsluiting(door, aType === "langGeenContact" ? "" : winkelT)}`;
    return `${t}${slot}`.trim();
  }, [aNaam, aTel, aProvider, aType, aHGB, aHMin, aHKost, aHOnbep, aNGB, aNMin, aNKost, aNOnbep, aDuur, aZelfde, aGeholpen, winkel, extra]);

  function bestellingTekst() {
    return `${getAanhef(bNaam.trim())}\n\nUw bestelling${bProduct.trim() ? ` (${bProduct.trim()})` : ""} is binnen en ligt klaar om te worden opgehaald in onze winkel.\n\nMet vriendelijke groet,\n\nTeam Telecombinatie ${winkel || ""}`.trim();
  }
  function reviewTekst() {
    const link = winkel ? (REVIEW_LINKS[winkel] || "[recensie link]") : "";
    const af = winkel ? (rGeholpen.trim() ? `${rGeholpen.trim()} - Telecombinatie ${winkel}` : `Team Telecombinatie ${winkel}`) : (rGeholpen.trim() ? `${rGeholpen.trim()} - Telecombinatie` : "Team Telecombinatie");
    return `${getAanhef(rNaam.trim())}\n\nBedankt voor je bezoek aan onze winkel! We hopen dat je een fijne ervaring had en tevreden bent. Wil je ons een klein plezier doen door een korte review achter te laten? Via de link kun je snel en makkelijk een berichtje en een score geven.\n\nSuper bedankt en nog een fijne dag! \n\nMet vriendelijke groet,\n${af}\n${link}`.trim();
  }
  function uitnodigingTekst() {
    const aanhef = getAanhef(uNaam.trim());
    if (uType === "uitnodiging") return `${aanhef}\n\nWij hebben u al een paar keer geprobeerd te bereiken over het verlengen van uw abonnement.\n\nGraag nodigen wij u uit om eens langs te komen in de winkel, zodat wij samen kunnen kijken naar een passend voorstel en onverwacht hoge kosten kunnen voorkomen.\n\nEen afspraak plannen kan natuurlijk ook via onze website.\n\nMet vriendelijke groet,\n\nTeam Telecombinatie ${winkel || ""}`.trim();
    if (uType === "abonnement") return `${aanhef}\n\nUw abonnement is mogelijk verlengbaar. Wij kijken graag samen met u naar een passend nieuw aanbod dat aansluit op uw gebruik en wensen.\n\nU bent van harte welkom in onze winkel voor persoonlijk advies.\n\nMet vriendelijke groet,\n\nTeam Telecombinatie ${winkel || ""}`.trim();
    return `${aanhef}\n\nOp dit moment hebben wij mooie acties in onze winkel.\n\nKom gerust eens langs, dan laten wij u graag zien welke aanbiedingen op dit moment interessant voor u zijn.\n\nMet vriendelijke groet,\n\nTeam Telecombinatie ${winkel || ""}`.trim();
  }
  function verzekeringTekst() {
    return `Beste ${vNaam.trim() || "(NAAM KLANT)"},\n\nHierbij ontvangt u een voorbeeldtekst voor het opzeggen van een telefoonverzekering.\nU kunt deze tekst gebruiken en versturen naar: service.nl@wertgarantie.com\n\nOpzegging telefoonverzekering\n\nGeachte heer/mevrouw,\n\nHierbij wil ik mijn telefoonverzekering beëindigen.\n\nMijn gegevens zijn als volgt:\nNaam: ${vNaam.trim() || "[naam klant]"}\nAdres: ${vAdres.trim() || "[adres klant]"}\nTelefoonnummer: ${vTel.trim() || "[telefoonnummer]"}\nPolisnummer: ${vPolis.trim() || "[polisnummer]"}\nIMEI-nummer: ${vIMEI.trim() || "[IMEI-nummer]"}\n\nIk verzoek u vriendelijk de opzegging te bevestigen.\n\nMet vriendelijke groet,\n${vNaam.trim() || "[naam klant]"}`.trim();
  }

  function setPreviewFrom(tekst: string, phone: string, email: string, onderwerp: string) {
    setPreview(tekst); setLastPhone(phone); setLastEmail(email); setLastOnderwerp(onderwerp);
  }

  function sendWA(phone: string) {
    const nr = formatPhone(phone);
    if (!validPhone(nr)) { alert("Voer eerst een geldig telefoonnummer in."); return; }
    window.open(`https://wa.me/${nr}?text=${encodeURIComponent(preview)}`, "_blank");
  }
  function sendEmail(email: string, onderwerp: string) {
    if (!validEmail(email)) { alert("Voer eerst een geldig e-mailadres in."); return; }
    window.location.href = `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(preview)}`;
  }

  function copyRetentie(type: string) {
    if (!retNaam.trim()) { alert("Vul eerst uw naam in."); return; }
    const now = new Date(); const p = (v: number) => String(v).padStart(2, "0");
    const datum = `${p(now.getDate())}-${p(now.getMonth()+1)}-${now.getFullYear()}`;
    const tijd = `${p(now.getHours())}:${p(now.getMinutes())}`;
    const tel = aTel.trim();
    const label = tel ? `${tel} ${type}` : type;
    navigator.clipboard.writeText(`${datum} ${retNaam.trim()}: ${label} (${tijd})`).catch(() => {});
  }

  async function copyPreview() {
    if (!preview.trim()) return;
    await navigator.clipboard.writeText(preview);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  function addExtra() {
    setExtra(prev => [...prev, { id: Date.now(), telefoon: "", huidigeGB: "", huidigeMinuten: "", huidigeKosten: "", onbeperkt: false, nieuweGB: "", nieuweMinuten: "", nieuweKosten: "", nieuwOnbeperkt: false, zelfde: false }]);
  }
  function updateExtra(id: number, patch: Partial<ExtraNummer>) {
    setExtra(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }
  function removeExtra(id: number) { setExtra(prev => prev.filter(e => e.id !== id)); }

  const cardClass = "bg-white rounded-xl border border-gray-200 p-4 space-y-3";
  const sectionTitle = "text-xs font-bold text-[#840562] uppercase tracking-wider mb-2";

  // ── Abonnement form ──────────────────────────────────────────────────────────
  function AbonnementForm() {
    return (
      <div className={cardClass}>
        <h2 className="font-semibold text-gray-800 text-sm">Abonnement verlengen</h2>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelClass}>Naam klant</label><input value={aNaam} onChange={e=>setANaam(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Telefoonnummer</label><input value={aTel} onChange={e=>setATel(e.target.value)} className={inputClass} /><DupWarn phone={aTel} /></div>
          <div><label className={labelClass}>E-mail</label><input value={aEmail} onChange={e=>setAEmail(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Provider</label>
            <select value={aProvider} onChange={e=>setAProvider(e.target.value)} className={inputClass}>
              <option value="">Kies…</option>{PROVIDERS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="col-span-2"><label className={labelClass}>Type voorstel</label>
            <select value={aType} onChange={e=>setAType(e.target.value)} className={inputClass}>
              <option value="voorstel3gg">WA voorstel</option>
              <option value="contact">Voorstel na contact</option>
              <option value="langGeenContact">Voorstel oude lijsten</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="border border-gray-100 rounded-lg p-3 space-y-2">
            <p className={sectionTitle}>Huidig abonnement</p>
            <div><label className={labelClass}>Bundel</label><input value={aHGB} onChange={e=>setAHGB(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Belminuten</label><input value={aHMin} onChange={e=>setAHMin(e.target.value)} className={inputClass} /></div>
            <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={aHOnbep} onChange={e=>setAHOnbep(e.target.checked)} className="accent-[#840562]" />Onbeperkt bellen</label>
            <div><label className={labelClass}>Kosten (€)</label><input value={aHKost} onChange={e=>setAHKost(e.target.value)} className={inputClass} /></div>
          </div>
          <div className="border border-gray-100 rounded-lg p-3 space-y-2">
            <p className={sectionTitle}>Nieuw abonnement</p>
            <div><label className={labelClass}>Bundel</label><input value={aNGB} onChange={e=>setANGB(e.target.value)} disabled={aZelfde} className={inputClass+" disabled:bg-gray-50"} /></div>
            <div><label className={labelClass}>Belminuten</label><input value={aNMin} onChange={e=>setANMin(e.target.value)} disabled={aZelfde} className={inputClass+" disabled:bg-gray-50"} /></div>
            <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={aNOnbep} onChange={e=>setANOnbep(e.target.checked)} disabled={aZelfde} className="accent-[#840562]" />Onbeperkt bellen</label>
            <div className="flex gap-2">
              {["1","12","24"].map(d=><label key={d} className={`flex-1 text-center text-xs rounded-lg py-1.5 cursor-pointer border transition-colors ${aDuur===d ? "bg-[#840562] text-white border-[#840562]" : "border-gray-200 text-gray-600 hover:border-[#840562]"}`}><input type="radio" className="hidden" value={d} checked={aDuur===d} onChange={()=>setADuur(d)} />{d}mnd</label>)}
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={aZelfde} onChange={e=>setAZelfde(e.target.checked)} className="accent-[#840562]" />Bundel blijft gelijk</label>
            <div><label className={labelClass}>Kosten (€)</label><input value={aNKost} onChange={e=>setANKost(e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        {extra.map((e, idx) => (
          <div key={e.id} className="border border-gray-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between"><p className="text-xs font-bold text-gray-500">Extra nummer {idx+1}</p><button onClick={()=>removeExtra(e.id)} className="text-gray-300 hover:text-red-400"><X size={14} /></button></div>
            <div><label className={labelClass}>Telefoonnummer</label><input value={e.telefoon} onChange={ev=>updateExtra(e.id,{telefoon:ev.target.value})} className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-gray-100 rounded-lg p-2 space-y-1.5">
                <p className="text-xs font-bold text-gray-400">Huidig</p>
                <input placeholder="Bundel" value={e.huidigeGB} onChange={ev=>updateExtra(e.id,{huidigeGB:ev.target.value})} className={inputClass} />
                <input placeholder="Belminuten" value={e.huidigeMinuten} onChange={ev=>updateExtra(e.id,{huidigeMinuten:ev.target.value})} className={inputClass} />
                <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={e.onbeperkt} onChange={ev=>updateExtra(e.id,{onbeperkt:ev.target.checked})} className="accent-[#840562]" />Onbeperkt</label>
                <input placeholder="Kosten (€)" value={e.huidigeKosten} onChange={ev=>updateExtra(e.id,{huidigeKosten:ev.target.value})} className={inputClass} />
              </div>
              <div className="border border-gray-100 rounded-lg p-2 space-y-1.5">
                <p className="text-xs font-bold text-gray-400">Nieuw</p>
                <input placeholder="Bundel" value={e.nieuweGB} onChange={ev=>updateExtra(e.id,{nieuweGB:ev.target.value})} disabled={e.zelfde} className={inputClass+" disabled:bg-gray-50"} />
                <input placeholder="Belminuten" value={e.nieuweMinuten} onChange={ev=>updateExtra(e.id,{nieuweMinuten:ev.target.value})} disabled={e.zelfde} className={inputClass+" disabled:bg-gray-50"} />
                <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={e.nieuwOnbeperkt} onChange={ev=>updateExtra(e.id,{nieuwOnbeperkt:ev.target.checked})} disabled={e.zelfde} className="accent-[#840562]" />Onbeperkt</label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={e.zelfde} onChange={ev=>updateExtra(e.id,{zelfde:ev.target.checked})} className="accent-[#840562]" />Gelijk blijft</label>
                <input placeholder="Kosten (€)" value={e.nieuweKosten} onChange={ev=>updateExtra(e.id,{nieuweKosten:ev.target.value})} className={inputClass} />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addExtra} className="flex items-center gap-1.5 text-xs text-[#840562] font-medium hover:text-[#6d044f]"><Plus size={13} />Extra nummer toevoegen</button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div><label className={labelClass}>Geholpen door</label><input value={aGeholpen} onChange={e=>{setAGeholpen(e.target.value);setRetNaam(e.target.value);}} className={inputClass} /></div>
        </div>

        <div className="flex gap-2 pt-1 flex-wrap">
          <BtnWA onClick={()=>{
            if(!aGeholpen.trim()){alert("Vul 'Geholpen door' in.");return;}
            const t=buildAbonnementTekst();
            setPreviewFrom(t,aTel,aEmail,"Voorstel abonnement Telecombinatie");
            addLog(aTel,"Voorstel abonnement Telecombinatie",winkel);
            copyRetentie("GG, WA voorstel");
            sendWA(aTel);
          }} />
          <BtnMail onClick={()=>{
            if(!aGeholpen.trim()){alert("Vul 'Geholpen door' in.");return;}
            const t=buildAbonnementTekst();
            setPreviewFrom(t,aTel,aEmail,"Voorstel abonnement Telecombinatie");
            sendEmail(aEmail,"Voorstel abonnement Telecombinatie");
          }} />
          <BtnReset onClick={()=>{setANaam("");setATel("");setAEmail("");setAProvider("");setAType("voorstel3gg");setAHGB("");setAHMin("");setAHKost("");setAHOnbep(false);setANGB("");setANMin("");setANKost("");setANOnbep(false);setADuur("24");setAZelfde(false);setExtra([]);}} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Topbar */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {(["abonnement","overige"] as Tab[]).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab===t ? "bg-[#840562] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
              {t==="abonnement" ? "Abonnementen" : "Overige vensters"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <div><label className="text-xs text-gray-500 mr-1.5">Locatie:</label>
            <select value={winkel} onChange={e=>setWinkel(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
              <option value="">Kies…</option>{WINKELS.map(w=><option key={w}>{w}</option>)}
            </select>
          </div>
          <button onClick={()=>{setLogs(getLogs());setShowLog(true);}} className="flex items-center gap-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm transition-colors"><BookOpen size={14} />Logboek</button>
        </div>
      </div>

      {/* Main grid */}
      {tab === "abonnement" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div><AbonnementForm /></div>
          <div className="space-y-4">
            {/* Preview */}
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm">Voorbeeld bericht</h2>
                <button onClick={copyPreview} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#840562] border border-gray-200 rounded-lg px-2 py-1 transition-colors">
                  {copied ? <><Check size={12} className="text-green-500" /><span className="text-green-600">Gekopieerd</span></> : <><Copy size={12} />Kopieer</>}
                </button>
              </div>
              <textarea value={preview} onChange={e=>setPreview(e.target.value)} rows={10} placeholder="Hier verschijnt het voorbeeldbericht…" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#840562] font-mono text-xs" />
              <div className="flex gap-2 flex-wrap">
                <BtnWA onClick={()=>{ if(!lastPhone){alert("Geen telefoonnummer.");return;} copyRetentie("GG, WA voorstel"); addLog(lastPhone,lastOnderwerp,winkel); sendWA(lastPhone); }} />
                <BtnMail onClick={()=>{ if(!lastEmail){alert("Geen e-mailadres.");return;} sendEmail(lastEmail,lastOnderwerp); }} />
                <BtnReset onClick={()=>setPreview("")} />
              </div>
            </div>
            {/* Retentie */}
            <div className={cardClass}>
              <h2 className="font-semibold text-gray-800 text-sm">CRM notitie</h2>
              <div><label className={labelClass}>Uw naam</label><input value={retNaam} onChange={e=>setRetNaam(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Klant telefoonnummer</label><input value={aTel} readOnly className={inputClass+" bg-gray-50 text-gray-400"} /></div>
              <div className="flex gap-2 flex-wrap">
                {["GG","Afspraak ingepland","Komt langs","GG, WA voorstel"].map(t=>(
                  <button key={t} onClick={()=>copyRetentie(t)} className="text-xs border border-gray-200 px-2.5 py-1.5 rounded-lg hover:border-[#840562] hover:text-[#840562] transition-colors">{t}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {/* Planning */}
            <div className={cardClass}>
              <h2 className="font-semibold text-gray-800 text-sm">Planning deze week</h2>
              {(() => { const w = Math.ceil((((new Date()).getTime() - new Date(new Date().getFullYear(),0,1).getTime())/86400000+1)/7); return (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Week <strong className="text-gray-700">{w}</strong></p>
                  <div className="border border-gray-100 rounded-lg p-3"><p className="text-sm font-semibold text-gray-700">Actiepunt 1 — WA-voorstellen uitsturen</p><p className="text-xs text-gray-500 mt-0.5">Alle WA-voorstellen versturen naar de weeklijsten die door Inge zijn aangeleverd.</p></div>
                  <div className="border border-gray-100 rounded-lg p-3"><p className="text-sm font-semibold text-gray-700">Actiepunt 2 — Controle & klantcontact</p><p className="text-xs text-gray-500 mt-0.5">[Week {w-1}] volledig controleren. Klanten maximaal twee keer bellen. Bij geen gehoor: WA-voorstel sturen.</p></div>
                </div>
              );})()}
            </div>
            {/* Uitnodiging */}
            <div className={cardClass}>
              <h2 className="font-semibold text-gray-800 text-sm">Overige berichten</h2>
              <div><label className={labelClass}>Naam klant</label><input value={uNaam} onChange={e=>setUNaam(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Telefoonnummer</label><input value={uTel} onChange={e=>setUTel(e.target.value)} className={inputClass} /><DupWarn phone={uTel} /></div>
              <div><label className={labelClass}>E-mail</label><input value={uEmail} onChange={e=>setUEmail(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Type bericht</label>
                <select value={uType} onChange={e=>setUType(e.target.value)} className={inputClass}>
                  <option value="uitnodiging">Uitnodiging winkel</option>
                  <option value="abonnement">Uitnodiging abonnement</option>
                  <option value="actie">Acties in de winkel</option>
                </select>
              </div>
              <div className="flex gap-2 flex-wrap">
                <BtnWA onClick={()=>{const t=uitnodigingTekst();setPreviewFrom(t,uTel,uEmail,"Bericht van Telecombinatie");addLog(uTel,"Bericht van Telecombinatie",winkel);sendWA(uTel);}} />
                <BtnMail onClick={()=>{const t=uitnodigingTekst();setPreviewFrom(t,uTel,uEmail,"Bericht van Telecombinatie");sendEmail(uEmail,"Bericht van Telecombinatie");}} />
                <BtnReset onClick={()=>{setUNaam("");setUTel("");setUEmail("");setUType("uitnodiging");}} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="space-y-4">
            {/* Bestelling */}
            <div className={cardClass}>
              <h2 className="font-semibold text-gray-800 text-sm">Bestelling binnen</h2>
              <div><label className={labelClass}>Naam klant</label><input value={bNaam} onChange={e=>setBNaam(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Telefoonnummer</label><input value={bTel} onChange={e=>setBTel(e.target.value)} className={inputClass} /><DupWarn phone={bTel} /></div>
              <div><label className={labelClass}>E-mail</label><input value={bEmail} onChange={e=>setBEmail(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Product</label><input value={bProduct} onChange={e=>setBProduct(e.target.value)} className={inputClass} /></div>
              <div className="flex gap-2 flex-wrap">
                <BtnWA onClick={()=>{const t=bestellingTekst();setPreviewFrom(t,bTel,bEmail,"Uw bestelling is binnen");addLog(bTel,"Uw bestelling is binnen",winkel);sendWA(bTel);}} />
                <BtnMail onClick={()=>{const t=bestellingTekst();setPreviewFrom(t,bTel,bEmail,"Uw bestelling is binnen");sendEmail(bEmail,"Uw bestelling is binnen");}} />
                <BtnReset onClick={()=>{setBNaam("");setBTel("");setBEmail("");setBProduct("");}} />
              </div>
            </div>
            {/* Uitnodiging overige */}
            <div className={cardClass}>
              <h2 className="font-semibold text-gray-800 text-sm">Overige berichten</h2>
              <div><label className={labelClass}>Naam klant</label><input value={uNaam} onChange={e=>setUNaam(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Telefoonnummer</label><input value={uTel} onChange={e=>setUTel(e.target.value)} className={inputClass} /><DupWarn phone={uTel} /></div>
              <div><label className={labelClass}>E-mail</label><input value={uEmail} onChange={e=>setUEmail(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Type bericht</label>
                <select value={uType} onChange={e=>setUType(e.target.value)} className={inputClass}>
                  <option value="uitnodiging">Uitnodiging winkel</option>
                  <option value="abonnement">Uitnodiging abonnement</option>
                  <option value="actie">Acties in de winkel</option>
                </select>
              </div>
              <div className="flex gap-2 flex-wrap">
                <BtnWA onClick={()=>{const t=uitnodigingTekst();setPreviewFrom(t,uTel,uEmail,"Bericht van Telecombinatie");addLog(uTel,"Bericht van Telecombinatie",winkel);sendWA(uTel);}} />
                <BtnMail onClick={()=>{const t=uitnodigingTekst();setPreviewFrom(t,uTel,uEmail,"Bericht van Telecombinatie");sendEmail(uEmail,"Bericht van Telecombinatie");}} />
                <BtnReset onClick={()=>{setUNaam("");setUTel("");setUEmail("");setUType("uitnodiging");}} />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {/* Review */}
            <div className={cardClass}>
              <h2 className="font-semibold text-gray-800 text-sm">Recensie versturen</h2>
              <div><label className={labelClass}>Naam klant</label><input value={rNaam} onChange={e=>setRNaam(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Telefoonnummer</label><input value={rTel} onChange={e=>setRTel(e.target.value)} className={inputClass} /><DupWarn phone={rTel} /></div>
              <div><label className={labelClass}>E-mail</label><input value={rEmail} onChange={e=>setREmail(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Geholpen door</label><input value={rGeholpen} onChange={e=>setRGeholpen(e.target.value)} className={inputClass} /></div>
              <div className="flex gap-2 flex-wrap">
                <BtnWA onClick={()=>{const t=reviewTekst();setPreviewFrom(t,rTel,rEmail,"Review verzoek Telecombinatie");addLog(rTel,"Review verzoek Telecombinatie",winkel);sendWA(rTel);}} />
                <BtnMail onClick={()=>{const t=reviewTekst();setPreviewFrom(t,rTel,rEmail,"Review verzoek Telecombinatie");sendEmail(rEmail,"Review verzoek Telecombinatie");}} />
                <BtnReset onClick={()=>{setRNaam("");setRTel("");setREmail("");setRGeholpen("");}} />
              </div>
            </div>
            {/* Verzekering */}
            <div className={cardClass}>
              <h2 className="font-semibold text-gray-800 text-sm">Wertgarantie opzeggen</h2>
              <div><label className={labelClass}>Naam klant</label><input value={vNaam} onChange={e=>setVNaam(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Telefoonnummer</label><input value={vTel} onChange={e=>setVTel(e.target.value)} className={inputClass} /><DupWarn phone={vTel} /></div>
              <div><label className={labelClass}>E-mail</label><input value={vEmail} onChange={e=>setVEmail(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Adres</label><input value={vAdres} onChange={e=>setVAdres(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Polisnummer</label><input value={vPolis} onChange={e=>setVPolis(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>IMEI-nummer</label><input value={vIMEI} onChange={e=>setVIMEI(e.target.value)} className={inputClass} /></div>
              <div className="flex gap-2 flex-wrap">
                <BtnWA onClick={()=>{const t=verzekeringTekst();setPreviewFrom(t,vTel,vEmail,"Opzegging telefoonverzekering");addLog(vTel,"Opzegging telefoonverzekering",winkel);sendWA(vTel);}} />
                <BtnMail onClick={()=>{const t=verzekeringTekst();setPreviewFrom(t,vTel,vEmail,"Opzegging telefoonverzekering");sendEmail(vEmail,"Opzegging telefoonverzekering");}} />
                <BtnReset onClick={()=>{setVNaam("");setVTel("");setVEmail("");setVAdres("");setVPolis("");setVIMEI("");}} />
              </div>
            </div>
          </div>
          <div>
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm">Voorbeeld bericht</h2>
                <button onClick={copyPreview} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#840562] border border-gray-200 rounded-lg px-2 py-1 transition-colors">
                  {copied ? <><Check size={12} className="text-green-500" /><span className="text-green-600">Gekopieerd</span></> : <><Copy size={12} />Kopieer</>}
                </button>
              </div>
              <textarea value={preview} onChange={e=>setPreview(e.target.value)} rows={12} placeholder="Hier verschijnt het voorbeeldbericht…" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#840562] font-mono text-xs" />
              <div className="flex gap-2 flex-wrap">
                <BtnWA onClick={()=>{ if(!lastPhone){alert("Geen telefoonnummer.");return;} addLog(lastPhone,lastOnderwerp,winkel); sendWA(lastPhone); }} />
                <BtnMail onClick={()=>{ if(!lastEmail){alert("Geen e-mailadres.");return;} sendEmail(lastEmail,lastOnderwerp); }} />
                <BtnReset onClick={()=>setPreview("")} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logboek modal */}
      {showLog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Logboek</h2>
              <button onClick={()=>setShowLog(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-1.5">
              {logs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nog geen logregels gevonden.</p>
              ) : logs.map((l, i) => (
                <div key={i} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 font-mono">
                  {l.date} — {l.phone} — {l.messageType} — {l.location}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
