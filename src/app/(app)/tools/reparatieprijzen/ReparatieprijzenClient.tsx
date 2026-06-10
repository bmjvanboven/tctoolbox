"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

interface Repair { cat: string; name: string; price: number; }
interface Model  { id: string; label: string; group?: string; repairs: Repair[]; }
interface Brand  { label: string; models: Model[]; }
type Data = Record<string, Brand>;

const CAT_LABELS: Record<string, string> = {
  scherm: "Scherm", accu: "Accu", camera: "Camera",
  geluid: "Geluid", knoppen: "Knoppen", overig: "Overig",
};

function prijsKleur(p: number) {
  if (p <= 59)  return "text-green-600 bg-green-50";
  if (p <= 109) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

export default function ReparatieprijzenClient({ data }: { data: Data }) {
  const [merk, setMerk]   = useState("");
  const [model, setModel] = useState("");
  const [zoek, setZoek]   = useState("");

  const merken = Object.keys(data);

  const modellen = useMemo(() => (!merk ? [] : data[merk].models), [data, merk]);

  const gekozenModel = useMemo(() => modellen.find(m => m.id === model) ?? null, [modellen, model]);

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

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
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
    </div>
  );
}
