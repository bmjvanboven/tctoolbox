"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Search, X } from "lucide-react";

interface PrijsEntry { id: number; gb: number; grade: string; prijs: number; }
interface ModelData  { id: number; naam: string; gb: number[]; prijzen: PrijsEntry[]; }
interface Rij { id: number; modelId: number | null; gb: string; grade: string; qty: number; }

let nextId = 1;
const GRADES = ["A", "B", "C"];

const GRADE_LABELS: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };

function gradeKleur(grade: string) {
  if (grade === "A") return "bg-green-100 text-green-700";
  if (grade === "B") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

export default function RefurbishedClient({ modellen }: { modellen: ModelData[] }) {
  const [tab, setTab] = useState<"inboeken" | "prijzen">("inboeken");
  const [zoek, setZoek] = useState("");

  // Inboeken state
  const [budget, setBudget] = useState("");
  const [rijen, setRijen]   = useState<Rij[]>([{ id: nextId++, modelId: null, gb: "", grade: "", qty: 1 }]);

  function setRij(id: number, patch: Partial<Rij>) {
    setRijen(prev => prev.map(r => r.id === id ? { ...r, ...patch, ...(patch.modelId !== undefined ? { gb: "", grade: "" } : {}) } : r));
  }

  function verkoopprijs(modelId: number | null, gb: string, grade: string): number {
    if (!modelId || !gb || !grade) return 0;
    const model = modellen.find(m => m.id === modelId);
    return model?.prijzen.find(p => p.gb === Number(gb) && p.grade === grade)?.prijs ?? 0;
  }

  const berekend = useMemo(() => {
    const pool = parseFloat(budget) || 0;
    const rows = rijen.map(r => ({ ...r, vp: verkoopprijs(r.modelId, r.gb, r.grade) })).map(r => ({ ...r, totaalVp: r.vp * r.qty }));
    const totaalVp = rows.reduce((s, r) => s + r.totaalVp, 0);
    return rows.map(r => {
      const kostPerStuk = totaalVp > 0 ? (r.vp / totaalVp) * pool : 0;
      return { ...r, kostPerStuk, totaalKost: kostPerStuk * r.qty, margePerStuk: r.vp - kostPerStuk, totaalMarge: (r.vp - kostPerStuk) * r.qty };
    });
  }, [rijen, budget, modellen]);

  const totalen = useMemo(() => ({
    qty:   berekend.reduce((s,r)=>s+r.qty,0),
    vp:    berekend.reduce((s,r)=>s+r.totaalVp,0),
    kost:  parseFloat(budget)||0,
    marge: berekend.reduce((s,r)=>s+r.totaalMarge,0),
  }), [berekend, budget]);

  // Prijsoverzicht gefilterd
  const gefilterd = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    if (!q) return modellen;
    return modellen.filter(m => m.naam.toLowerCase().includes(q));
  }, [zoek, modellen]);

  const fmt = (n: number) => n.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sel = "border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {([["inboeken", "Batch inboeken"], ["prijzen", "Prijsoverzicht"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === id ? "bg-[#840562] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Prijsoverzicht */}
      {tab === "prijzen" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={zoek} onChange={e => setZoek(e.target.value)}
                placeholder="Zoek toestel… bijv. iPhone 14, Samsung S23"
                className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />
              {zoek && <button onClick={() => setZoek("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>
            <p className="text-xs text-gray-400 mt-2">{gefilterd.length} van {modellen.length} toestellen</p>
          </div>

          <div className="space-y-3">
            {gefilterd.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-sm text-gray-400">Geen toestellen gevonden</div>
            ) : gefilterd.map(model => {
              // Groepeer per GB
              const perGb: Record<number, PrijsEntry[]> = {};
              for (const p of model.prijzen) (perGb[p.gb] ??= []).push(p);

              return (
                <div key={model.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-bold text-gray-800">{model.naam}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-5 py-2 text-xs font-semibold text-gray-400">Opslag</th>
                          {GRADES.map(g => (
                            <th key={g} className="text-center px-4 py-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeKleur(g)}`}>{GRADE_LABELS[g]}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {Object.entries(perGb).sort(([a],[b]) => Number(a)-Number(b)).map(([gb, prijzen]) => (
                          <tr key={gb} className="hover:bg-gray-50">
                            <td className="px-5 py-2.5 font-medium text-gray-700">{gb} GB</td>
                            {GRADES.map(g => {
                              const p = prijzen.find(x => x.grade === g);
                              return (
                                <td key={g} className="px-4 py-2.5 text-center">
                                  {p ? <span className="font-bold text-gray-800">€ {p.prijs}</span> : <span className="text-gray-300">—</span>}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Batch inboeken */}
      {tab === "inboeken" && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Totale inkoopprijs batch (excl. BTW)</label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">€</span>
              <input type="number" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="0,00"
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3">Model</th>
                    <th className="text-left px-4 py-3">GB</th>
                    <th className="text-left px-4 py-3">Grade</th>
                    <th className="text-left px-4 py-3 w-20">Aantal</th>
                    <th className="text-right px-4 py-3">Verkoopprijs</th>
                    <th className="text-right px-4 py-3">Kostprijs/stuk</th>
                    <th className="text-right px-4 py-3">Marge/stuk</th>
                    <th className="text-right px-4 py-3">Totaal marge</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {berekend.map(r => {
                    const model = modellen.find(m => m.id === r.modelId);
                    const margeKleur = r.margePerStuk < 0 ? "text-red-600" : r.margePerStuk < 20 ? "text-amber-600" : "text-green-600";
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5">
                          <select value={r.modelId ?? ""} onChange={e=>setRij(r.id,{modelId:e.target.value?Number(e.target.value):null})} className={`${sel} w-44`}>
                            <option value="">Model…</option>
                            {modellen.map(m=><option key={m.id} value={m.id}>{m.naam}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          <select value={r.gb} onChange={e=>setRij(r.id,{gb:e.target.value})} disabled={!r.modelId} className={`${sel} w-24`}>
                            <option value="">GB…</option>
                            {(model?.gb??[]).map(g=><option key={g} value={g}>{g} GB</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          <select value={r.grade} onChange={e=>setRij(r.id,{grade:e.target.value})} disabled={!r.modelId} className={`${sel} w-24`}>
                            <option value="">Grade…</option>
                            {GRADES.map(g=><option key={g} value={g}>Grade {g}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          <input type="number" min={1} value={r.qty} onChange={e=>setRij(r.id,{qty:Math.max(1,parseInt(e.target.value)||1)})} className={`${sel} w-16 text-center`} />
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-600">{r.vp?`€ ${r.vp}`:"—"}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-gray-800">{r.kostPerStuk?`€ ${fmt(r.kostPerStuk)}`:"—"}</td>
                        <td className={`px-4 py-2.5 text-right font-medium ${r.vp?margeKleur:"text-gray-400"}`}>{r.vp?`€ ${fmt(r.margePerStuk)}`:"—"}</td>
                        <td className={`px-4 py-2.5 text-right font-medium ${r.vp?margeKleur:"text-gray-400"}`}>{r.vp?`€ ${fmt(r.totaalMarge)}`:"—"}</td>
                        <td className="px-4 py-2.5"><button onClick={()=>setRijen(p=>p.filter(x=>x.id!==r.id))} className="p-1 text-gray-300 hover:text-red-400"><Trash2 size={14} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <button onClick={()=>setRijen(p=>[...p,{id:nextId++,modelId:null,gb:"",grade:"",qty:1}])} className="flex items-center gap-1.5 text-sm text-[#840562] hover:text-[#6d044f] font-medium">
                <Plus size={15} />Toestel toevoegen
              </button>
            </div>
          </div>

          {parseFloat(budget)>0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {label:"Totaal toestellen", waarde:totalen.qty},
                {label:"Totale verkoopwaarde", waarde:`€ ${fmt(totalen.vp)}`},
                {label:"Totale inkoopprijs", waarde:`€ ${fmt(totalen.kost)}`},
                {label:"Totale marge", waarde:`€ ${fmt(totalen.marge)}`, groen:totalen.marge>=0},
              ].map(item=>(
                <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-400 font-medium mb-1">{item.label}</p>
                  <p className={`text-lg font-bold ${"groen" in item?(item.groen?"text-green-600":"text-red-600"):"text-gray-800"}`}>{item.waarde}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
