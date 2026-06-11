"use client";

import { useState, useEffect } from "react";
import { Phone, RotateCcw, ChevronRight, User, Lightbulb, CheckCircle, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocatie } from "@/lib/LocatieContext";

type OptionType = "neutral" | "positive" | "warning" | "solo";

interface Option {
  label: string;
  sub?: string;
  type: OptionType;
  next: string;
}

interface ScriptStep {
  type?: "script";
  n: number;
  total: number;
  script: string;
  customer_says?: string;
  tip?: string;
  prompt: string;
  options: Option[];
}

interface OutcomeStep {
  type: "outcome";
  color: "green" | "orange";
  title: string;
  sub: string;
  tips: string[];
}

type Step = ScriptStep | OutcomeStep;

const STEPS: Record<string, Step> = {
  opening: {
    n: 1, total: 4,
    script: `Goedemiddag, met **{naam}** van Telecombinatie **{locatie}**, hallo.\n\nIk bel even naar aanleiding van jouw mobiele abonnement dat binnenkort afloopt….. Dat kan zeer hoogstwaarschijnlijk weer een stuk voordeliger.\n\nEn wij vroegen ons af of u het prettig zou vinden om hier eens naar te kijken door middel van een afspraak in de winkel?`,
    prompt: "Hoe reageert de klant?",
    options: [
      { label: '"Ja, ik wist het al"', sub: "of: heb een bericht / mail ontvangen", type: "neutral", next: "wist_het_al" },
      { label: '"Dat wist ik niet"', sub: "of: neutrale / positieve reactie", type: "neutral", next: "afspraak_vraag" },
    ],
  },
  wist_het_al: {
    n: 2, total: 4,
    script: `Aah wat goed! Mooi, ja, we bellen onze klanten altijd even na, want dat is niet altijd vanzelfsprekend. Daarbij is dit een stukje extra service voor de bestaande klant, zodat ze de mogelijkheid krijgen dat er echt iemand voor hen klaarstaat.`,
    customer_says: '"Oh oké."',
    prompt: "Klant reageert. Ga verder:",
    options: [
      { label: "Ga verder naar afsprakenvraag", type: "solo", next: "afspraak_vraag" },
    ],
  },
  afspraak_vraag: {
    n: 3, total: 4,
    script: `Ja, kijk, uw abonnement kan zeer hoogstwaarschijnlijk weer een stuk voordeliger — en daarom vroegen wij ons dus af of u het prettig zou vinden om hier eens naar te kijken door middel van een afspraak in de winkel?`,
    tip: "Zegt de klant dat hij/zij 'wel een keer langskomt' en ziet u in de verkoopgeschiedenis dat dit ook daadwerkelijk gebeurt? Ga dan niet pushen.",
    prompt: "Hoe reageert de klant?",
    options: [
      { label: '"Ja, graag"', sub: "Klant wil een afspraak", type: "positive", next: "outcome_afspraak" },
      { label: '"Moet ik per se een afspraak?"', sub: "Klant twijfelt", type: "neutral", next: "niet_per_se" },
      { label: '"Ik kom wel een keer langs"', sub: "Klant wil liever inlopen", type: "warning", next: "outcome_later" },
    ],
  },
  niet_per_se: {
    n: 4, total: 4,
    script: `Nee, dat hoeft niet per se. U mag het ook doen zoals u het altijd al gedaan heeft en gewoon langskomen. Dit is puur voor het geval het druk is in de winkel, zodat u niet hoeft te wachten.`,
    prompt: "Hoe reageert de klant?",
    options: [
      { label: '"Oké, dan toch een afspraak"', sub: "Klant kiest voor afspraak", type: "positive", next: "outcome_afspraak" },
      { label: '"Ik kom gewoon langs"', sub: "Klant wil inlopen", type: "warning", next: "outcome_later" },
    ],
  },
  outcome_afspraak: {
    type: "outcome", color: "green",
    title: "Afspraak inplannen",
    sub: "Goed gesprek — plan de afspraak in het systeem.",
    tips: [
      "Vraag naar een gewenste datum en tijdstip",
      "Noteer de afspraak in het systeem",
      "Stuur de klant een bevestiging",
      "Bereid het dossier voor op de afspraakdag",
    ],
  },
  outcome_later: {
    type: "outcome", color: "orange",
    title: "Noteer voor later",
    sub: "De klant komt zelf langs — respecteer dat.",
    tips: [
      "Noteer in het systeem dat de klant zelf langskomt",
      "Controleer later of de klant daadwerkelijk is geweest",
      "Niet pushen — dat werkt averechts",
      "Bij no-show: eventueel telefonische verlenging aanbieden",
    ],
  },
};

function renderScript(text: string, naam: string, locatie: string) {
  return text.replace(/{naam}/g, naam).replace(/{locatie}/g, locatie).split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-[#840562] font-semibold">{part}</strong> : part
        )}
        <br />
      </span>
    );
  });
}

export default function BelscriptPage() {
  const { data: session } = useSession();
  const { locatie: ctxLocatie } = useLocatie();
  const voornaam = session?.user.name?.split(" ")[0] ?? "";

  const [naam, setNaam] = useState(voornaam);
  const [locatie, setLocatie] = useState(ctxLocatie);
  const [stapId, setStapId] = useState("opening");
  const [gestart, setGestart] = useState(false);

  useEffect(() => { if (voornaam && !naam) setNaam(voornaam); }, [voornaam]);
  useEffect(() => { if (ctxLocatie && !locatie) setLocatie(ctxLocatie); }, [ctxLocatie]);

  const stap = STEPS[stapId];
  const kanStarten = naam.trim() && locatie;

  if (!gestart) {
    return (
      <div className="max-w-sm">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Phone size={18} className="text-[#840562]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Retentiebellen</h2>
              <p className="text-xs text-gray-400">Begeleid script voor aflopende abonnementen</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Jouw naam</label>
            <input
              type="text"
              value={naam}
              onChange={e => setNaam(e.target.value)}
              onKeyDown={e => e.key === "Enter" && kanStarten && setGestart(true)}
              placeholder="Bijv. Tim"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Locatie</label>
            {locatie ? (
              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
                <span className="text-sm text-gray-700">{locatie}</span>
                <span className="text-xs text-gray-400">via profiel</span>
              </div>
            ) : (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                Stel je locatie in via de selector rechtsboven.
              </p>
            )}
          </div>

          <button
            onClick={() => kanStarten && setGestart(true)}
            disabled={!kanStarten}
            className="w-full bg-[#840562] hover:bg-[#6d044f] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            Start gesprek <ChevronRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  // Outcome
  if (stap.type === "outcome") {
    const outcome = stap as OutcomeStep;
    const isGreen = outcome.color === "green";
    return (
      <div className="max-w-lg space-y-3">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className={`px-5 py-4 border-b border-gray-100 flex items-center gap-3 ${isGreen ? "bg-green-50" : "bg-amber-50"}`}>
            {isGreen
              ? <CheckCircle size={18} className="text-green-600 shrink-0" />
              : <Clock size={18} className="text-amber-600 shrink-0" />}
            <div>
              <p className={`text-sm font-semibold ${isGreen ? "text-green-800" : "text-amber-800"}`}>{outcome.title}</p>
              <p className={`text-xs ${isGreen ? "text-green-600" : "text-amber-600"}`}>{outcome.sub}</p>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vervolgstappen</p>
            <ul className="space-y-2">
              {outcome.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <ChevronRight size={14} className="text-[#840562] mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={() => setStapId("opening")}
          className="w-full bg-white border border-gray-200 hover:border-[#840562] hover:text-[#840562] text-gray-600 font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Phone size={15} /> Nieuw gesprek starten
        </button>
      </div>
    );
  }

  // Script stap
  const script = stap as ScriptStep;
  return (
    <div className="max-w-xl space-y-3">
      {/* Progress + reset */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {Array.from({ length: script.total }, (_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
              i + 1 < script.n ? "bg-[#840562]" : i + 1 === script.n ? "bg-[#ef8400]" : "bg-gray-200"
            }`} />
          ))}
        </div>
        <span className="text-xs text-gray-400 shrink-0">Stap {script.n}/{script.total}</span>
        <button onClick={() => { setGestart(false); setStapId("opening"); }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#840562] border border-gray-200 hover:border-[#840562] rounded-lg px-2.5 py-1.5 transition-colors">
          <RotateCcw size={11} /> Opnieuw
        </button>
      </div>

      {/* Script */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <Phone size={13} className="text-[#840562]" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jij zegt</span>
        </div>
        <div className="px-5 py-4 text-sm leading-relaxed text-gray-800">
          {renderScript(script.script, naam, locatie)}
        </div>
      </div>

      {/* Klant zegt */}
      {script.customer_says && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <User size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm italic text-gray-500">Klant: {script.customer_says}</p>
        </div>
      )}

      {/* Tip */}
      {script.tip && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <Lightbulb size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">{script.tip}</p>
        </div>
      )}

      {/* Keuzes */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{script.prompt}</p>
        <div className="space-y-2">
          {script.options.map((opt, i) => {
            if (opt.type === "solo") return (
              <button key={i} onClick={() => setStapId(opt.next)}
                className="w-full bg-[#840562] hover:bg-[#6d044f] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                {opt.label} <ChevronRight size={14} />
              </button>
            );
            const styles = {
              positive: "border-green-200 bg-green-50 hover:border-green-400",
              warning:  "border-amber-200 bg-amber-50 hover:border-amber-400",
              neutral:  "border-gray-200 bg-white hover:border-[#840562]",
            };
            const labelStyles = {
              positive: "text-green-800", warning: "text-amber-800", neutral: "text-gray-800",
            };
            return (
              <button key={i} onClick={() => setStapId(opt.next)}
                className={`w-full border rounded-xl px-4 py-3 text-left transition-colors ${styles[opt.type]}`}>
                <span className={`block text-sm font-semibold ${labelStyles[opt.type]}`}>{opt.label}</span>
                {opt.sub && <span className="block text-xs text-gray-400 mt-0.5">{opt.sub}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
