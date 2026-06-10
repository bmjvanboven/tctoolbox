"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Check, X } from "lucide-react";

type Item = { id: number; cat: string; naam: string; prijs: number };
type Model = { id: number; modelKey: string; label: string; groep?: string | null; items: Item[] };
type Merk = { id: number; key: string; label: string; modellen: Model[] };

const CAT_LABELS: Record<string, string> = {
  scherm: "Scherm", accu: "Accu", camera: "Camera",
  geluid: "Geluid", knoppen: "Knoppen", overig: "Overig",
};

function PrijsCell({ item }: { item: Item }) {
  const [editing, setEditing] = useState(false);
  const [waarde, setWaarde] = useState(String(item.prijs));
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function opslaan() {
    if (Number(waarde) === item.prijs) { setEditing(false); return; }
    setSaving(true);
    await fetch("/api/admin/reparatieprijzen", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, prijs: waarde }),
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
        className="w-20 border border-[#840562] rounded px-2 py-1 text-sm text-right focus:outline-none" />
      <button onClick={opslaan} disabled={saving} className="p-1 bg-[#840562] text-white rounded hover:bg-[#6d044f]"><Check size={12} /></button>
      <button onClick={() => setEditing(false)} className="p-1 border border-gray-300 rounded hover:bg-gray-50"><X size={12} /></button>
    </div>
  );

  const kleur = item.prijs <= 59 ? "text-green-600 bg-green-50" : item.prijs <= 109 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
  return (
    <button onClick={() => setEditing(true)} className={`text-sm font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:ring-2 hover:ring-[#840562] transition-all ${kleur}`}>
      € {item.prijs}
    </button>
  );
}

export default function ReparatiePrijzenBeheer({ merken }: { merken: Merk[] }) {
  const [openMerk, setOpenMerk] = useState<number | null>(merken[0]?.id ?? null);
  const [openModel, setOpenModel] = useState<number | null>(null);
  const [zoek, setZoek] = useState("");

  return (
    <div className="space-y-4">
      <input value={zoek} onChange={e => setZoek(e.target.value)} placeholder="Zoek model of reparatie…"
        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />

      {merken.map(merk => (
        <div key={merk.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button onClick={() => setOpenMerk(openMerk === merk.id ? null : merk.id)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
            {openMerk === merk.id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
            <span className="font-semibold text-gray-800">{merk.label}</span>
            <span className="text-xs text-gray-400">{merk.modellen.length} modellen</span>
          </button>

          {openMerk === merk.id && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {merk.modellen.filter(m => !zoek || m.label.toLowerCase().includes(zoek.toLowerCase()) || m.items.some(i => i.naam.toLowerCase().includes(zoek.toLowerCase()))).map(model => {
                const cats: Record<string, Item[]> = {};
                for (const item of model.items) {
                  if (zoek && !item.naam.toLowerCase().includes(zoek.toLowerCase()) && !model.label.toLowerCase().includes(zoek.toLowerCase())) continue;
                  (cats[item.cat] ??= []).push(item);
                }
                if (Object.keys(cats).length === 0 && zoek) return null;
                return (
                  <div key={model.id}>
                    <button onClick={() => setOpenModel(openModel === model.id ? null : model.id)}
                      className="w-full flex items-center gap-3 px-8 py-3 hover:bg-gray-50 transition-colors text-left">
                      {openModel === model.id ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                      <span className="text-sm font-medium text-gray-700">{model.label}</span>
                      {model.groep && <span className="text-xs text-gray-400">{model.groep}</span>}
                    </button>
                    {(openModel === model.id || zoek) && (
                      <div className="px-8 pb-3 space-y-3">
                        {Object.entries(cats).map(([cat, items]) => (
                          <div key={cat}>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{CAT_LABELS[cat] ?? cat}</p>
                            <div className="space-y-1">
                              {items.map(item => (
                                <div key={item.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50">
                                  <span className="text-sm text-gray-600">{item.naam}</span>
                                  <PrijsCell item={item} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
