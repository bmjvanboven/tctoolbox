"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

type Prijs = { id: number; gb: number; grade: string; prijs: number };
type Model = { id: number; naam: string; prijzen: Prijs[] };

const GRADES = ["A", "B", "C"];

function PrijsCell({ prijs }: { prijs: Prijs }) {
  const [editing, setEditing] = useState(false);
  const [waarde, setWaarde] = useState(String(prijs.prijs));
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function opslaan() {
    if (Number(waarde) === prijs.prijs) { setEditing(false); return; }
    setSaving(true);
    await fetch("/api/admin/verkoopprijzen", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prijs.id, prijs: waarde }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-400">€</span>
      <input autoFocus value={waarde} onChange={e => setWaarde(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") opslaan(); if (e.key === "Escape") setEditing(false); }}
        className="w-16 border border-[#840562] rounded px-1.5 py-1 text-sm text-right focus:outline-none" />
      <button onClick={opslaan} disabled={saving} className="p-1 bg-[#840562] text-white rounded hover:bg-[#6d044f]"><Check size={11} /></button>
      <button onClick={() => setEditing(false)} className="p-1 border border-gray-300 rounded hover:bg-gray-50"><X size={11} /></button>
    </div>
  );

  return (
    <button onClick={() => setEditing(true)} className="text-sm font-medium text-gray-700 hover:text-[#840562] hover:underline cursor-pointer px-1">
      € {prijs.prijs}
    </button>
  );
}

export default function VerkoopPrijzenBeheer({ modellen }: { modellen: Model[] }) {
  const [zoek, setZoek] = useState("");
  const gefilterd = zoek ? modellen.filter(m => m.naam.toLowerCase().includes(zoek.toLowerCase())) : modellen;

  // Verzamel alle unieke GB waarden
  const alleGb = [...new Set(modellen.flatMap(m => m.prijzen.map(p => p.gb)))].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <input value={zoek} onChange={e => setZoek(e.target.value)} placeholder="Zoek model…"
        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Model</th>
                {alleGb.flatMap(gb => GRADES.map(g => (
                  <th key={`${gb}-${g}`} className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {gb}GB {g}
                  </th>
                )))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gefilterd.map(model => (
                <tr key={model.id} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 font-medium text-gray-800 whitespace-nowrap">{model.naam}</td>
                  {alleGb.flatMap(gb => GRADES.map(g => {
                    const prijs = model.prijzen.find(p => p.gb === gb && p.grade === g);
                    return (
                      <td key={`${gb}-${g}`} className="px-3 py-2.5 text-center">
                        {prijs ? <PrijsCell prijs={prijs} /> : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    );
                  }))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
