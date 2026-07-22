"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

interface PrijsEntry { id: number; gb: number; grade: string; prijs: number; }
interface ModelData  { id: number; naam: string; prijzen: PrijsEntry[]; }

const GRADES = ["A", "B", "C"];
const GRADE_LABELS: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };

function gradeKleur(grade: string) {
  if (grade === "A") return "bg-green-100 text-green-700";
  if (grade === "B") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

export default function VerkoopClient({ modellen }: { modellen: ModelData[] }) {
  const [zoek, setZoek] = useState("");

  const gefilterd = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    if (!q) return modellen;
    return modellen.filter(m => m.naam.toLowerCase().includes(q));
  }, [zoek, modellen]);

  return (
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
                    {Object.entries(perGb).sort(([a], [b]) => Number(a) - Number(b)).map(([gb, prijzen]) => (
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
  );
}
