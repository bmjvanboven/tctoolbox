"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Plus, Trash2 } from "lucide-react";

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

function NieuwePrijsCell({ modelId, gb, grade }: { modelId: number; gb: number; grade: string }) {
  const [editing, setEditing] = useState(false);
  const [waarde, setWaarde] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function opslaan() {
    if (!waarde) { setEditing(false); return; }
    setSaving(true);
    await fetch("/api/admin/verkoopprijzen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId, gb, grade, prijs: waarde }),
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
    <button onClick={() => setEditing(true)} className="text-xs text-gray-300 hover:text-[#840562] cursor-pointer px-1">
      + instellen
    </button>
  );
}

function NieuwToestelForm({ onKlaar }: { onKlaar: () => void }) {
  const [naam, setNaam] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function toevoegen() {
    if (!naam.trim()) return;
    setSaving(true);
    await fetch("/api/admin/verkoopprijzen/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: naam.trim() }),
    });
    setSaving(false);
    onKlaar();
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-4 bg-white rounded-xl border border-gray-200">
      <input autoFocus value={naam} onChange={e => setNaam(e.target.value)} placeholder="Naam toestel (bijv. iPhone 17)"
        onKeyDown={e => { if (e.key === "Enter") toevoegen(); if (e.key === "Escape") onKlaar(); }}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      <button onClick={toevoegen} disabled={saving} className="px-3 py-1.5 bg-[#840562] text-white text-sm font-medium rounded-lg hover:bg-[#6d044f] disabled:opacity-50">
        Toestel toevoegen
      </button>
      <button onClick={onKlaar} className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100"><X size={14} /></button>
    </div>
  );
}

export default function VerkoopPrijzenBeheer({ modellen }: { modellen: Model[] }) {
  const [zoek, setZoek] = useState("");
  const [nieuwToestel, setNieuwToestel] = useState(false);
  const router = useRouter();
  const gefilterd = zoek ? modellen.filter(m => m.naam.toLowerCase().includes(zoek.toLowerCase())) : modellen;

  // Verzamel alle unieke GB waarden, altijd inclusief 512GB
  const alleGb = [...new Set([...modellen.flatMap(m => m.prijzen.map(p => p.gb)), 512])].sort((a, b) => a - b);

  async function verwijderModel(id: number, naam: string) {
    if (!confirm(`"${naam}" volledig verwijderen, inclusief alle in- en verkoopprijzen?`)) return;
    await fetch(`/api/admin/verkoopprijzen/model?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

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
                <th className="px-3 py-3 w-10" />
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
                        {prijs ? <PrijsCell prijs={prijs} /> : <NieuwePrijsCell modelId={model.id} gb={gb} grade={g} />}
                      </td>
                    );
                  }))}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => verwijderModel(model.id, model.naam)} className="p-1 text-gray-300 hover:text-red-600" title="Toestel verwijderen">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {nieuwToestel ? (
        <NieuwToestelForm onKlaar={() => setNieuwToestel(false)} />
      ) : (
        <button onClick={() => setNieuwToestel(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#840562] hover:underline">
          <Plus size={14} /> Toestel toevoegen
        </button>
      )}
    </div>
  );
}
