"use client";

import { useState, type ReactNode } from "react";
import { Search, ChevronLeft, RotateCcw, AlertTriangle } from "lucide-react";
import type { ModelData } from "./InkoopClient";

type Grade = "A" | "B" | "C";
type JaNee = "ja" | "nee" | null;
type SchermSchade = "geen" | "zwaarBekrast" | "gebarstenOfBeschadigd" | null;
type SchermConditie = "geenGebruikssporen" | "minimaleTekenen" | "sommigeSporen" | "zichtbareSlijtage" | null;
type RandConditie = "goed" | "gebruikssporen" | "beschadigd" | null;

interface FunctieCheck {
  gaatAan: JaNee;
  netwerk: JaNee;
  faceId: JaNee;
  selfieCamera: JaNee;
  luidspreker: JaNee;
}

interface SchermFunctie {
  heldereVlekken: boolean;
  dodePixels: boolean;
  lijnen: boolean;
  ingebrandBeeld: boolean;
}

const STAP_TITELS = {
  model: "Welk toestel wil je inkopen?",
  opslag: "Welke opslagcapaciteit?",
  functie: "Functiecheck",
  schermfunctie: "Schermfunctionaliteit",
  schermschade: "Schade aan het scherm",
  schermconditie: "Schermconditie",
  zijkant: "Conditie zijkant",
  achterkant: "Conditie achterkant",
  resultaat: "Resultaat",
} as const;

type StapKey = keyof typeof STAP_TITELS;

const RANG: Record<Grade, number> = { A: 0, B: 1, C: 2 };
function ergsteGrade(gradez: Grade[]): Grade {
  return gradez.reduce((w, g) => (RANG[g] > RANG[w] ? g : w), "A" as Grade);
}
function gradeVanConditie(c: Exclude<SchermConditie, null>): Grade {
  if (c === "geenGebruikssporen" || c === "minimaleTekenen") return "A";
  if (c === "sommigeSporen") return "B";
  return "C";
}
function gradeVanRand(c: Exclude<RandConditie, null>): Grade {
  if (c === "goed") return "A";
  if (c === "gebruikssporen") return "B";
  return "C";
}
function gradeKleur(grade: Grade) {
  if (grade === "A") return "bg-green-100 text-green-700 border-green-200";
  if (grade === "B") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-600 border-red-200";
}

const FUNCTIE_LABELS: Record<keyof FunctieCheck, string> = {
  gaatAan: "Gaat aan",
  netwerk: "Verbindt met netwerk",
  faceId: "Face ID / vingerafdruk",
  selfieCamera: "Selfiecamera",
  luidspreker: "Luidspreker",
};
const SCHERM_FUNCTIE_LABELS: Record<keyof SchermFunctie, string> = {
  heldereVlekken: "Heldere plekken / lichtlekkage",
  dodePixels: "Dode pixels",
  lijnen: "Lijnen op het scherm",
  ingebrandBeeld: "Ingebrand beeld",
};
const SCHERM_SCHADE_LABELS: Record<Exclude<SchermSchade, null>, string> = {
  geen: "Geen schade",
  zwaarBekrast: "Zwaar bekrast",
  gebarstenOfBeschadigd: "Gebarsten of beschadigd",
};
const SCHERM_CONDITIE_LABELS: Record<Exclude<SchermConditie, null>, string> = {
  geenGebruikssporen: "Geen gebruikssporen",
  minimaleTekenen: "Minimale tekenen van slijtage",
  sommigeSporen: "Sommige sporen van slijtage",
  zichtbareSlijtage: "Zichtbare slijtage",
};
const RAND_CONDITIE_LABELS: Record<Exclude<RandConditie, null>, string> = {
  goed: "Geen zichtbare schade",
  gebruikssporen: "Lichte gebruikssporen",
  beschadigd: "Zichtbare schade",
};

const optieKaart = "text-left w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-colors hover:border-[#840562] hover:bg-[#840562]/5";

export default function InkoopCalculator({ modellen }: { modellen: ModelData[] }) {
  const [pad, setPad] = useState<StapKey[]>(["model"]);
  const stap = pad[pad.length - 1];

  const [modelZoek, setModelZoek] = useState("");
  const [modelId, setModelId] = useState<number | null>(null);
  const [gb, setGb] = useState<number | null>(null);
  const [functie, setFunctie] = useState<FunctieCheck>({ gaatAan: null, netwerk: null, faceId: null, selfieCamera: null, luidspreker: null });
  const [schermFunctie, setSchermFunctie] = useState<SchermFunctie>({ heldereVlekken: false, dodePixels: false, lijnen: false, ingebrandBeeld: false });
  const [schermSchade, setSchermSchade] = useState<SchermSchade>(null);
  const [schermConditie, setSchermConditie] = useState<SchermConditie>(null);
  const [zijkant, setZijkant] = useState<RandConditie>(null);
  const [achterkant, setAchterkant] = useState<RandConditie>(null);

  const model = modellen.find(m => m.id === modelId) ?? null;

  function ga(naar: StapKey) { setPad(p => [...p, naar]); }
  function terug() { setPad(p => (p.length > 1 ? p.slice(0, -1) : p)); }
  function opnieuw() {
    setPad(["model"]);
    setModelZoek(""); setModelId(null); setGb(null);
    setFunctie({ gaatAan: null, netwerk: null, faceId: null, selfieCamera: null, luidspreker: null });
    setSchermFunctie({ heldereVlekken: false, dodePixels: false, lijnen: false, ingebrandBeeld: false });
    setSchermSchade(null); setSchermConditie(null); setZijkant(null); setAchterkant(null);
  }

  function kiesModel(m: ModelData) { setModelId(m.id); setGb(null); ga("opslag"); }
  function kiesOpslag(waarde: number) { setGb(waarde); ga("functie"); }
  function alleFunctiesGoed() { setFunctie({ gaatAan: "ja", netwerk: "ja", faceId: "ja", selfieCamera: "ja", luidspreker: "ja" }); }

  // Toestel dat niet aangaat of geen netwerk vindt, kan sowieso niet als werkend refurbished toestel verkocht worden.
  function functieVolgende() {
    const kritiek = functie.gaatAan === "nee" || functie.netwerk === "nee";
    ga(kritiek ? "resultaat" : "schermfunctie");
  }
  // Een functioneel schermdefect (i.t.t. cosmetische schade) maakt het toestel net als een gebarsten scherm alleen geschikt voor onderdelen.
  function schermfunctieVolgende() {
    const defect = schermFunctie.heldereVlekken || schermFunctie.dodePixels || schermFunctie.lijnen || schermFunctie.ingebrandBeeld;
    ga(defect ? "resultaat" : "schermschade");
  }
  function kiesSchermSchade(waarde: Exclude<SchermSchade, null>) {
    setSchermSchade(waarde);
    if (waarde === "gebarstenOfBeschadigd") ga("resultaat");
    else if (waarde === "zwaarBekrast") ga("zijkant");
    else ga("schermconditie");
  }
  function kiesSchermConditie(waarde: Exclude<SchermConditie, null>) { setSchermConditie(waarde); ga("zijkant"); }
  function kiesZijkant(waarde: Exclude<RandConditie, null>) { setZijkant(waarde); ga("achterkant"); }
  function kiesAchterkant(waarde: Exclude<RandConditie, null>) { setAchterkant(waarde); ga("resultaat"); }

  const gefilterdeModellen = modelZoek
    ? modellen.filter(m => m.naam.toLowerCase().includes(modelZoek.toLowerCase()))
    : modellen;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[420px] flex flex-col">
        <div className="flex items-center gap-2 mb-5">
          {stap !== "model" && stap !== "resultaat" && (
            <button onClick={terug} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <ChevronLeft size={18} />
            </button>
          )}
          <h2 className="text-lg font-bold text-gray-800">{STAP_TITELS[stap]}</h2>
        </div>

        <div className="flex-1">
          {stap === "model" && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input autoFocus value={modelZoek} onChange={e => setModelZoek(e.target.value)}
                  placeholder="Zoek toestel… bijv. iPhone 14, Samsung S23"
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {gefilterdeModellen.map(m => (
                  <button key={m.id} onClick={() => kiesModel(m)} className={optieKaart}>
                    <span className="font-medium text-gray-800">{m.naam}</span>
                  </button>
                ))}
                {gefilterdeModellen.length === 0 && <p className="text-sm text-gray-400 col-span-2 py-4 text-center">Geen toestellen gevonden</p>}
              </div>
            </div>
          )}

          {stap === "opslag" && model && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {model.gb.map(g => (
                <button key={g} onClick={() => kiesOpslag(g)} className={`${optieKaart} text-center`}>
                  <span className="font-semibold text-gray-800">{g} GB</span>
                </button>
              ))}
            </div>
          )}

          {stap === "functie" && (
            <div className="space-y-4">
              <div className="flex justify-end -mt-1">
                <button onClick={alleFunctiesGoed} className="text-xs font-medium text-[#840562] hover:underline">
                  Alles werkt goed
                </button>
              </div>
              {([
                ["gaatAan", "Gaat het toestel aan?"],
                ["netwerk", "Kan het toestel verbinden met het netwerk?"],
                ["faceId", "Werkt Face ID / vingerafdruk?"],
                ["selfieCamera", "Werkt de selfiecamera?"],
                ["luidspreker", "Werkt de luidspreker?"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-700">{label}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {(["ja", "nee"] as const).map(w => (
                      <button key={w} onClick={() => setFunctie(f => ({ ...f, [key]: w }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                          functie[key] === w
                            ? w === "ja" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}>
                        {w === "ja" ? "Ja" : "Nee"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={functieVolgende} disabled={Object.values(functie).some(v => v === null)}
                className="w-full mt-2 px-4 py-2.5 bg-[#840562] text-white text-sm font-semibold rounded-lg hover:bg-[#6d044f] disabled:opacity-40 disabled:cursor-not-allowed">
                Volgende
              </button>
            </div>
          )}

          {stap === "schermfunctie" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Heeft het scherm een van onderstaande problemen? Selecteer wat van toepassing is — laat leeg als het scherm geen problemen heeft.</p>
              <div className="space-y-2">
                {([
                  ["heldereVlekken", "Heldere plekken / lichtlekkage"],
                  ["dodePixels", "Dode pixels"],
                  ["lijnen", "Lijnen op het scherm"],
                  ["ingebrandBeeld", "Ingebrand beeld"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={schermFunctie[key]} onChange={e => setSchermFunctie(s => ({ ...s, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-[#840562]" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              <button onClick={schermfunctieVolgende} className="w-full mt-2 px-4 py-2.5 bg-[#840562] text-white text-sm font-semibold rounded-lg hover:bg-[#6d044f]">
                Volgende
              </button>
            </div>
          )}

          {stap === "schermschade" && (
            <div className="space-y-2.5">
              <button onClick={() => kiesSchermSchade("geen")} className={optieKaart}>
                <p className="font-semibold text-gray-800">Geen schade</p>
                <p className="text-xs text-gray-400 mt-0.5">Het glas is heel, geen barsten of beschadigingen.</p>
              </button>
              <button onClick={() => kiesSchermSchade("zwaarBekrast")} className={optieKaart}>
                <p className="font-semibold text-gray-800">Zwaar bekrast</p>
                <p className="text-xs text-gray-400 mt-0.5">Het glas is heel, maar heeft duidelijke, voelbare krassen.</p>
              </button>
              <button onClick={() => kiesSchermSchade("gebarstenOfBeschadigd")} className={optieKaart}>
                <p className="font-semibold text-gray-800">Gebarsten of beschadigd</p>
                <p className="text-xs text-gray-400 mt-0.5">Het glas is gebarsten, gebroken of (deels) los.</p>
              </button>
            </div>
          )}

          {stap === "schermconditie" && (
            <div className="space-y-2.5">
              {([
                ["zichtbareSlijtage", "Zichtbare slijtage", "Het scherm heeft zichtbare krassen. Krassen kunnen worden gevoeld met je vinger en zijn zichtbaar zonder lamp.", false],
                ["sommigeSporen", "Sommige sporen van slijtage", "Het scherm heeft lichte krassen, meestal in de hoeken.", false],
                ["minimaleTekenen", "Minimale tekenen van slijtage", "Micro krassen, bijna perfect. Alleen zichtbaar onder licht.", true],
                ["geenGebruikssporen", "Geen gebruikssporen", "Het scherm ziet er als nieuw uit, geen zichtbare krassen onder een lamp.", false],
              ] as const).map(([key, titel, omschrijving, meestGekozen]) => (
                <button key={key} onClick={() => kiesSchermConditie(key)} className={optieKaart}>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{titel}</p>
                    {meestGekozen && <span className="text-[10px] font-bold text-[#840562] bg-[#840562]/10 px-1.5 py-0.5 rounded-full">Meest gekozen</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{omschrijving}</p>
                </button>
              ))}
            </div>
          )}

          {stap === "zijkant" && (
            <div className="space-y-2.5">
              <button onClick={() => kiesZijkant("goed")} className={optieKaart}>
                <p className="font-semibold text-gray-800">Geen zichtbare schade</p>
                <p className="text-xs text-gray-400 mt-0.5">De zijkanten zien er goed uit, geen deuken of krassen.</p>
              </button>
              <button onClick={() => kiesZijkant("gebruikssporen")} className={optieKaart}>
                <p className="font-semibold text-gray-800">Lichte gebruikssporen</p>
                <p className="text-xs text-gray-400 mt-0.5">Kleine krasjes, geen deuken.</p>
              </button>
              <button onClick={() => kiesZijkant("beschadigd")} className={optieKaart}>
                <p className="font-semibold text-gray-800">Zichtbare deuken of diepe krassen</p>
                <p className="text-xs text-gray-400 mt-0.5">Duidelijke deuken en/of diepe krassen in het frame.</p>
              </button>
            </div>
          )}

          {stap === "achterkant" && (
            <div className="space-y-2.5">
              <button onClick={() => kiesAchterkant("goed")} className={optieKaart}>
                <p className="font-semibold text-gray-800">Geen zichtbare schade</p>
                <p className="text-xs text-gray-400 mt-0.5">De achterkant ziet er goed uit, geen krassen of scheuren.</p>
              </button>
              <button onClick={() => kiesAchterkant("gebruikssporen")} className={optieKaart}>
                <p className="font-semibold text-gray-800">Lichte gebruikssporen</p>
                <p className="text-xs text-gray-400 mt-0.5">Kleine krasjes, geen scheuren of deuken.</p>
              </button>
              <button onClick={() => kiesAchterkant("beschadigd")} className={optieKaart}>
                <p className="font-semibold text-gray-800">Zichtbare krassen, scheuren of deuken</p>
                <p className="text-xs text-gray-400 mt-0.5">Duidelijke schade aan de achterkant.</p>
              </button>
            </div>
          )}

          {stap === "resultaat" && model && gb !== null && (
            <ResultaatWeergave
              model={model} gb={gb} functie={functie} schermFunctie={schermFunctie}
              schermSchade={schermSchade} schermConditie={schermConditie} zijkant={zijkant} achterkant={achterkant}
            />
          )}
        </div>
      </div>

      {stap === "resultaat" && (
        <button onClick={opnieuw} className="mt-4 mx-auto flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#840562]">
          <RotateCcw size={14} /> Nieuwe berekening
        </button>
      )}
    </div>
  );
}

function ResultaatWeergave({ model, gb, functie, schermFunctie, schermSchade, schermConditie, zijkant, achterkant }: {
  model: ModelData; gb: number; functie: FunctieCheck; schermFunctie: SchermFunctie;
  schermSchade: SchermSchade; schermConditie: SchermConditie; zijkant: RandConditie; achterkant: RandConditie;
}) {
  const kritiekeFunctiestoring = functie.gaatAan === "nee" || functie.netwerk === "nee";
  const schermFunctieDefect = schermFunctie.heldereVlekken || schermFunctie.dodePixels || schermFunctie.lijnen || schermFunctie.ingebrandBeeld;
  const schermGebroken = schermSchade === "gebarstenOfBeschadigd";
  const naarOnderdelen = kritiekeFunctiestoring || schermFunctieDefect || schermGebroken;

  let kop: ReactNode;

  if (naarOnderdelen) {
    const reden = kritiekeFunctiestoring
      ? "Het toestel gaat niet aan of kan niet verbinden met het netwerk."
      : schermFunctieDefect
        ? "Het scherm heeft een functioneel defect (heldere plekken, dode pixels, lijnen of ingebrand beeld)."
        : "Het scherm is gebarsten of beschadigd.";

    kop = (
      <div className="text-center py-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-white mb-4">Onderdelen inname</span>
        <p className="text-sm text-gray-500 mb-4">{reden}<br />Dit toestel is niet geschikt om te refurbishen en wordt ingenomen voor onderdelen.</p>
        {model.onderdelenInname !== null ? (
          <p className="text-3xl font-bold text-gray-800">€ {model.onderdelenInname}</p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-amber-600 text-sm">
            <AlertTriangle size={16} /> Geen onderdelenprijs bekend voor dit model — neem contact op met beheer.
          </div>
        )}
      </div>
    );
  } else {
    // Als we hier zijn, is de wizard niet vroegtijdig afgebroken naar "onderdelen", dus zijn
    // schermconditie (of zwaar bekrast), zijkant en achterkant altijd al beantwoord.
    const overigeFunctiestoring = functie.faceId === "nee" || functie.selfieCamera === "nee" || functie.luidspreker === "nee";
    const schermGrade: Grade = schermSchade === "zwaarBekrast" ? "C" : gradeVanConditie(schermConditie!);
    const zijkantGrade: Grade = gradeVanRand(zijkant!);
    const achterkantGrade: Grade = gradeVanRand(achterkant!);
    let grade = ergsteGrade([schermGrade, zijkantGrade, achterkantGrade]);
    if (overigeFunctiestoring) grade = ergsteGrade([grade, "C"]);

    const prijs = model.prijzen.find(p => p.gb === gb && p.grade === grade)?.innamePrijs ?? null;

    kop = (
      <div className="text-center py-6">
        <p className="text-sm text-gray-400 mb-1">{model.naam} · {gb} GB</p>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-4 ${gradeKleur(grade)}`}>Grade {grade}</span>
        {prijs !== null ? (
          <p className="text-3xl font-bold text-gray-800">€ {prijs}</p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-amber-600 text-sm">
            <AlertTriangle size={16} /> Geen inkoopprijs bekend voor deze combinatie — neem contact op met beheer.
          </div>
        )}
        <div className="flex justify-center gap-3 mt-5 text-xs text-gray-400">
          <span>Scherm: <b className="text-gray-600">{schermGrade}</b></span>
          <span>Zijkant: <b className="text-gray-600">{zijkantGrade}</b></span>
          <span>Achterkant: <b className="text-gray-600">{achterkantGrade}</b></span>
        </div>
        {overigeFunctiestoring && (
          <p className="text-xs text-amber-600 mt-2">Grade beperkt tot C door functieprobleem (Face ID, selfiecamera of luidspreker).</p>
        )}
      </div>
    );
  }

  // Toon alleen de vragen die daadwerkelijk beantwoord zijn — de wizard kan vroegtijdig
  // naar "onderdelen inname" zijn gesprongen, waardoor latere stappen zijn overgeslagen.
  const schermfunctieBeantwoord = !kritiekeFunctiestoring;
  const schermschadeBeantwoord = schermfunctieBeantwoord && !schermFunctieDefect;
  const schermconditieBeantwoord = schermschadeBeantwoord && schermSchade === "geen" && schermConditie !== null;
  const randenBeantwoord = schermschadeBeantwoord && !schermGebroken;

  const schermfunctieProblemen = (Object.keys(schermFunctie) as (keyof SchermFunctie)[]).filter(k => schermFunctie[k]);

  return (
    <div>
      {kop}
      <div className="text-left bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
        <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100">Overzicht</p>
        <OverzichtRegel label="Model">{model.naam}</OverzichtRegel>
        <OverzichtRegel label="Opslag">{gb} GB</OverzichtRegel>
        {(Object.keys(FUNCTIE_LABELS) as (keyof FunctieCheck)[]).map(key => (
          <OverzichtRegel key={key} label={FUNCTIE_LABELS[key]}><JaNeeIcoon waarde={functie[key]} /></OverzichtRegel>
        ))}
        {schermfunctieBeantwoord && (
          <OverzichtRegel label="Schermfunctionaliteit">
            {schermfunctieProblemen.length > 0
              ? schermfunctieProblemen.map(k => SCHERM_FUNCTIE_LABELS[k]).join(", ")
              : "Geen problemen"}
          </OverzichtRegel>
        )}
        {schermschadeBeantwoord && schermSchade && (
          <OverzichtRegel label="Schermschade">{SCHERM_SCHADE_LABELS[schermSchade]}</OverzichtRegel>
        )}
        {schermconditieBeantwoord && schermConditie && (
          <OverzichtRegel label="Schermconditie">{SCHERM_CONDITIE_LABELS[schermConditie]}</OverzichtRegel>
        )}
        {randenBeantwoord && zijkant && (
          <OverzichtRegel label="Zijkant">{RAND_CONDITIE_LABELS[zijkant]}</OverzichtRegel>
        )}
        {randenBeantwoord && achterkant && (
          <OverzichtRegel label="Achterkant">{RAND_CONDITIE_LABELS[achterkant]}</OverzichtRegel>
        )}
      </div>
    </div>
  );
}

function OverzichtRegel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-700 text-right">{children}</span>
    </div>
  );
}

function JaNeeIcoon({ waarde }: { waarde: JaNee }) {
  if (waarde === "ja") return <span className="text-green-600 font-semibold">Ja</span>;
  if (waarde === "nee") return <span className="text-red-600 font-semibold">Nee</span>;
  return <span className="text-gray-300">—</span>;
}
