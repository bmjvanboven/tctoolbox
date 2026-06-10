"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

interface Repair { cat: string; name: string; price: number; }
interface Model  { id: string; label: string; group?: string; repairs: Repair[]; }
interface Brand  { label: string; models: Model[]; }
type Data = Record<string, Brand>;

const CAT_LABELS: Record<string, string> = {
  scherm: "Scherm", accu: "Accu", camera: "Camera",
  geluid: "Geluid", knoppen: "Knoppen", overig: "Overig",
};

const POPULAIR = [
  "Scherm vervangen (origineel)",
  "Accu vervangen",
  "Scherm vervangen (namaak)",
  "Achterkant vervangen",
  "Laadconnector vervangen",
  "Camera achter vervangen",
  "Microfoon (bellen/onder)",
];

function prijsKleur(p: number) {
  if (p <= 59)  return "text-green-600 bg-green-50";
  if (p <= 109) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

export default function ReparatieprijzenClient({ data }: { data: Data }) {
  const [merk, setMerk]     = useState("");
  const [model, setModel]   = useState("");
  const [zoek, setZoek]     = useState("");
  const [globaalZoek, setGlobaalZoek] = useState("");

  const merken   = Object.keys(data);
  const modellen = useMemo(() => (!merk ? [] : data[merk].models), [data, merk]);
  const gekozenModel = useMemo(() => modellen.find(m => m.id === model) ?? null, [modellen, model]);

  // Globaal zoeken door alle merken/modellen — op modelnaam én reparatienaam
  const globaalResultaten = useMemo(() => {
    const q = globaalZoek.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    const woorden = q.split(/\s+/);
    const hits: { merk: string; model: string; reparatie: string; prijs: number; cat: string }[] = [];

    for (const [, brand] of Object.entries(data)) {
      for (const m of brand.models) {
        const modelMatch = woorden.every(w =>
          m.label.toLowerCase().includes(w) || brand.label.toLowerCase().includes(w)
        );
        for (const r of m.repairs) {
          const repairMatch = r.name.toLowerCase().includes(q);
          if (modelMatch || repairMatch) {
            hits.push({ merk: brand.label, model: m.label, reparatie: r.name, prijs: r.price, cat: r.cat });
          }
        }
      }
    }
    return hits.slice(0, 50);
  }, [globaalZoek, data]);

  const gefilterd = useMemo(() => {
    if (!gekozenModel) return [];
    const q = zoek.trim().toLowerCase();
    const repairs = q ? gekozenModel.repairs.filter(r => r.name.toLowerCase().includes(q)) : gekozenModel.repairs;
    const cats: Record<string, Repair[]> = {};
    for (const r of repairs) (cats[r.cat] ??= []).push(r);
    return Object.entries(cats);
  }, [gekozenModel, zoek]);

  const modelGroepen = useMemo(() => {
    const map: Record<string, Model[]> = {};
    for (const m of modellen) (map[m.group ?? "Overig"] ??= []).push(m);
    return map;
  }, [modellen]);

  const toonGlobaal = globaalZoek.trim().length >= 2;

  return (
    <div className="space-y-4">

      {/* Globale zoekbalk */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Snel zoeken — alle merken & modellen</label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={globaalZoek}
            onChange={e => setGlobaalZoek(e.target.value)}
            placeholder="Bijv. accu, scherm, laadconnector…"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]"
          />
          {globaalZoek && (
            <button onClick={() => setGlobaalZoek("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Populaire chips */}
        {!toonGlobaal && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {POPULAIR.map(p => (
              <button key={p} onClick={() => setGlobaalZoek(p.split(" ")[0])}
                className="text-xs bg-gray-100 hover:bg-purple-50 hover:text-[#840562] text-gray-600 px-2.5 py-1 rounded-full transition-colors">
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Globale zoekresultaten */}
      {toonGlobaal && (
        <>
          {globaalResultaten.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-sm text-gray-400">Niets gevonden voor &quot;{globaalZoek}&quot;</div>
          ) : (() => {
            // Groepeer per model als er weinig unieke modellen zijn, anders gewoon lijst
            const modellen = [...new Set(globaalResultaten.map(r => `${r.merk}|${r.model}`))];
            const perModel = modellen.length <= 4;

            if (perModel) {
              return modellen.map(key => {
                const [merkLabel, modelLabel] = key.split("|");
                const items = globaalResultaten.filter(r => r.merk === merkLabel && r.model === modelLabel);
                const perCat: Record<string, typeof items> = {};
                for (const i of items) (perCat[i.cat] ??= []).push(i);
                return (
                  <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 bg-[#840562]/5 border-b border-gray-100">
                      <p className="text-sm font-bold text-[#840562]">{modelLabel}</p>
                      <p className="text-xs text-gray-400">{merkLabel}</p>
                    </div>
                    {Object.entries(perCat).map(([cat, rs]) => (
                      <div key={cat}>
                        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{CAT_LABELS[cat] ?? cat}</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {rs.map((r, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3">
                              <span className="text-sm text-gray-700">{r.reparatie}</span>
                              <span className={`text-sm font-bold px-2.5 py-1 rounded-lg shrink-0 ml-4 ${prijsKleur(r.prijs)}`}>€ {r.prijs}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              });
            }

            return (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{globaalResultaten.length} resultaten voor &quot;{globaalZoek}&quot;</span>
                </div>
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {globaalResultaten.map((r, i) => (
                    <div key={i} className="flex items-center px-5 py-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium truncate">{r.reparatie}</p>
                        <p className="text-xs text-gray-400 truncate">{r.merk} · {r.model}</p>
                      </div>
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-lg shrink-0 ${prijsKleur(r.prijs)}`}>€ {r.prijs}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Merk/model selector */}
      {!toonGlobaal && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Of kies merk &amp; model</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Merk</label>
                <select value={merk} onChange={e => { setMerk(e.target.value); setModel(""); setZoek(""); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
                  <option value="">Kies merk…</option>
                  {merken.map(k => <option key={k} value={k}>{data[k].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Model</label>
                <select value={model} onChange={e => { setModel(e.target.value); setZoek(""); }} disabled={!merk}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] disabled:bg-gray-50 disabled:text-gray-400">
                  <option value="">Kies model…</option>
                  {Object.entries(modelGroepen).map(([groep, ms]) => (
                    <optgroup key={groep} label={groep}>
                      {ms.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            {gekozenModel && (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={zoek} onChange={e => setZoek(e.target.value)} placeholder="Zoek reparatie…"
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />
              </div>
            )}
          </div>

          {gekozenModel && (
            <div className="space-y-3">
              {zoek && <p className="text-xs text-gray-400 px-1">{gefilterd.reduce((s,[,rs])=>s+rs.length,0)} van {gekozenModel.repairs.length} reparaties</p>}
              {gefilterd.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-sm text-gray-400">Geen reparaties gevonden</div>
              ) : gefilterd.map(([cat, repairs]) => (
                <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{CAT_LABELS[cat] ?? cat}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {repairs.map((r, i) => {
                      const q = zoek.trim().toLowerCase();
                      const idx = q ? r.name.toLowerCase().indexOf(q) : -1;
                      return (
                        <div key={i} className="flex items-center justify-between px-5 py-3">
                          <span className="text-sm text-gray-700">
                            {idx >= 0 ? <>{r.name.slice(0,idx)}<mark className="bg-yellow-100 text-yellow-800 rounded px-0.5">{r.name.slice(idx,idx+q.length)}</mark>{r.name.slice(idx+q.length)}</> : r.name}
                          </span>
                          <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ml-4 shrink-0 ${prijsKleur(r.price)}`}>€ {r.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
