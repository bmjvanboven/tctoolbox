"use client";

import { useState } from "react";
import { Phone, RotateCcw, ChevronRight, User } from "lucide-react";

const LOCATIES = ["Deurne", "Asten", "Gemert", "Veghel", "Geldrop"];

type StepType = "script" | "outcome";
type OptionType = "neutral" | "positive" | "warning" | "solo";

interface Option {
  label: string;
  sub?: string;
  icon?: string;
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
  emoji: string;
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
      { label: '"Ja, ik wist het al"', sub: "of: heb een bericht / mail ontvangen", icon: "📬", type: "neutral", next: "wist_het_al" },
      { label: '"Dat wist ik niet"', sub: "of: neutrale / positieve reactie", icon: "💬", type: "neutral", next: "afspraak_vraag" },
    ],
  },

  wist_het_al: {
    n: 2, total: 4,
    script: `Aah wat goed! Mooi, ja, we bellen onze klanten altijd even na, want dat is niet altijd vanzelfsprekend. Daarbij is dit een stukje extra service voor de bestaande klant, zodat ze de mogelijkheid krijgen dat er echt iemand voor hen klaarstaat.`,
    customer_says: '"Oh oké."',
    prompt: "Klant reageert. Ga verder:",
    options: [
      { label: "Ga verder naar afsprakenvraag", icon: "→", type: "solo", next: "afspraak_vraag" },
    ],
  },

  afspraak_vraag: {
    n: 3, total: 4,
    script: `Ja, kijk, uw abonnement kan zeer hoogstwaarschijnlijk weer een stuk voordeliger — en daarom vroegen wij ons dus af of u het prettig zou vinden om hier eens naar te kijken door middel van een afspraak in de winkel?`,
    tip: "Zegt de klant dat hij/zij 'wel een keer langskomt' en ziet u in de verkoopgeschiedenis dat dit ook daadwerkelijk gebeurt? Ga dan niet pushen.",
    prompt: "Hoe reageert de klant?",
    options: [
      { label: '"Ja, graag"', sub: "Klant wil een afspraak", icon: "✅", type: "positive", next: "outcome_afspraak" },
      { label: '"Moet ik per se een afspraak?"', sub: "Klant twijfelt", icon: "🤔", type: "neutral", next: "niet_per_se" },
      { label: '"Ik kom wel een keer langs"', sub: "Klant wil liever inlopen", icon: "🚶", type: "warning", next: "outcome_later" },
    ],
  },

  niet_per_se: {
    n: 4, total: 4,
    script: `Nee, dat hoeft niet per se. U mag het ook doen zoals u het altijd al gedaan heeft en gewoon langskomen. Dit is puur voor het geval het druk is in de winkel, zodat u niet hoeft te wachten.`,
    prompt: "Hoe reageert de klant?",
    options: [
      { label: '"Oké, dan toch een afspraak"', sub: "Klant kiest voor afspraak", icon: "✅", type: "positive", next: "outcome_afspraak" },
      { label: '"Ik kom gewoon langs"', sub: "Klant wil inlopen", icon: "🚶", type: "warning", next: "outcome_later" },
    ],
  },

  outcome_afspraak: {
    type: "outcome",
    color: "green",
    emoji: "🎉",
    title: "Afspraak inplannen!",
    sub: "Geweldig gesprek — plan de afspraak in.",
    tips: [
      "Vraag naar een gewenste datum en tijdstip",
      "Noteer de afspraak in het systeem",
      "Stuur de klant een bevestiging",
      "Bereid het dossier voor op de afspraakdag",
    ],
  },

  outcome_later: {
    type: "outcome",
    color: "orange",
    emoji: "📝",
    title: "Noteer voor later",
    sub: "De klant komt zelf langs — respecteer dat.",
    tips: [
      "Noteer in het systeem dat de klant belt en zelf langskomt",
      "Controleer later in de verkoopgeschiedenis of de klant daadwerkelijk langskomt",
      "Niet pushen — dat werkt averechts",
      "Bij een no-show na verloop van tijd: eventueel telefonische verlenging aanbieden",
    ],
  },
};

function renderScript(text: string, naam: string, locatie: string) {
  return text
    .replace(/{naam}/g, naam)
    .replace(/{locatie}/g, locatie)
    .split("\n")
    .map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-[#840562] font-bold">{part}</strong> : part
          )}
          <br />
        </span>
      );
    });
}

export default function BelscriptPage() {
  const [fase, setFase] = useState<"setup" | "script">("setup");
  const [naam, setNaam] = useState("");
  const [locatie, setLocatie] = useState("");
  const [stapId, setStapId] = useState("opening");

  const stap = STEPS[stapId];
  const kanStarten = naam.trim() && locatie;

  function starten() {
    if (!kanStarten) return;
    setStapId("opening");
    setFase("script");
  }

  function opnieuw() {
    setStapId("opening");
  }

  function herstarten() {
    setFase("setup");
    setStapId("opening");
  }

  if (fase === "setup") {
    return (
      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#840562] via-[#b01870] to-[#ef8400] px-7 py-8">
            <div className="text-4xl mb-3">📞</div>
            <h2 className="text-xl font-black text-white mb-1">Retentiebellen</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Begeleid script voor het benaderen van klanten met een aflopend abonnement.
            </p>
          </div>

          <div className="px-7 py-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Uw naam</label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && starten()}
                placeholder="Bijv. Tim"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Locatie</label>
              <select
                value={locatie}
                onChange={(e) => setLocatie(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] bg-gray-50 focus:bg-white transition-colors appearance-none"
              >
                <option value="">Kies locatie…</option>
                {LOCATIES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <button
              onClick={starten}
              disabled={!kanStarten}
              className="w-full bg-[#840562] hover:bg-[#6d044f] disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              Start gesprek <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Outcome
  if (stap.type === "outcome") {
    const outcome = stap as OutcomeStep;
    const isGreen = outcome.color === "green";
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-8 text-center ${isGreen ? "bg-gradient-to-br from-green-600 to-green-400" : "bg-gradient-to-br from-amber-600 to-amber-400"}`}>
            <div className="text-5xl mb-3">{outcome.emoji}</div>
            <h2 className="text-2xl font-black text-white mb-1">{outcome.title}</h2>
            <p className="text-sm text-white/80">{outcome.sub}</p>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vervolgstappen</p>
            <ul className="space-y-2.5">
              {outcome.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <ChevronRight size={16} className="text-[#840562] mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={opnieuw}
          className="w-full bg-white border-2 border-[#840562] text-[#840562] hover:bg-[#840562] hover:text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Phone size={16} /> Nieuw gesprek starten
        </button>
      </div>
    );
  }

  // Script step
  const script = stap as ScriptStep;
  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Progressbalk */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5 flex-1">
          {Array.from({ length: script.total }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i + 1 < script.n ? "bg-[#840562]" : i + 1 === script.n ? "bg-[#ef8400] scale-y-110" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-gray-400 shrink-0">Stap {script.n} van {script.total}</span>
        <button onClick={herstarten} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#840562] border border-gray-200 hover:border-[#840562] rounded-lg px-2.5 py-1.5 transition-colors">
          <RotateCcw size={12} /> Opnieuw
        </button>
      </div>

      {/* Scriptkaart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-purple-50 border-b border-gray-100">
          <Phone size={14} className="text-[#840562]" />
          <span className="text-xs font-bold text-[#840562] uppercase tracking-wider">U zegt</span>
        </div>
        <div className="px-5 py-5 text-base leading-relaxed text-gray-800">
          {renderScript(script.script, naam, locatie)}
        </div>
      </div>

      {/* Klant zegt */}
      {script.customer_says && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <User size={16} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm italic text-gray-600">Klant: {script.customer_says}</p>
        </div>
      )}

      {/* Tip */}
      {script.tip && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <span className="text-base shrink-0">💡</span>
          <p className="text-sm text-amber-800">{script.tip}</p>
        </div>
      )}

      {/* Keuzes */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{script.prompt}</p>
        <div className="space-y-2.5">
          {script.options.map((opt, i) => {
            if (opt.type === "solo") {
              return (
                <button key={i} onClick={() => setStapId(opt.next)}
                  className="w-full bg-[#840562] hover:bg-[#6d044f] text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {opt.label} <ChevronRight size={15} />
                </button>
              );
            }
            const styles = {
              positive: "border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100",
              warning: "border-amber-200 bg-amber-50 hover:border-amber-400 hover:bg-amber-100",
              neutral: "border-gray-200 bg-white hover:border-[#840562] hover:bg-purple-50",
            };
            const labelStyles = {
              positive: "text-green-700",
              warning: "text-amber-700",
              neutral: "text-gray-800",
            };
            return (
              <button key={i} onClick={() => setStapId(opt.next)}
                className={`w-full border rounded-xl px-4 py-3.5 text-left flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-sm ${styles[opt.type]}`}>
                <span className="text-xl shrink-0">{opt.icon}</span>
                <span>
                  <span className={`block text-sm font-bold ${labelStyles[opt.type]}`}>{opt.label}</span>
                  {opt.sub && <span className="block text-xs text-gray-400 mt-0.5">{opt.sub}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
