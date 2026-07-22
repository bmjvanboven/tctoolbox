"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Check, X, Plus, Trash2, Pencil } from "lucide-react";

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

function TitelCell({ waarde: initieleWaarde, onOpslaan, className }: { waarde: string; onOpslaan: (nieuw: string) => Promise<void>; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [waarde, setWaarde] = useState(initieleWaarde);
  const [saving, setSaving] = useState(false);

  async function opslaan() {
    if (!waarde.trim() || waarde === initieleWaarde) { setEditing(false); setWaarde(initieleWaarde); return; }
    setSaving(true);
    await onOpslaan(waarde.trim());
    setSaving(false);
    setEditing(false);
  }

  if (editing) return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      <input autoFocus value={waarde} onChange={e => setWaarde(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") opslaan(); if (e.key === "Escape") { setEditing(false); setWaarde(initieleWaarde); } }}
        className="border border-[#840562] rounded px-2 py-0.5 text-sm focus:outline-none" />
      <button onClick={opslaan} disabled={saving} className="p-1 bg-[#840562] text-white rounded hover:bg-[#6d044f]"><Check size={12} /></button>
      <button onClick={() => { setEditing(false); setWaarde(initieleWaarde); }} className="p-1 border border-gray-300 rounded hover:bg-gray-50"><X size={12} /></button>
    </div>
  );

  return (
    <span
      onClick={e => { e.stopPropagation(); setEditing(true); }}
      className={`group inline-flex items-center gap-1.5 cursor-pointer hover:text-[#840562] ${className ?? ""}`}
    >
      {initieleWaarde}
      <Pencil size={11} className="text-gray-300 group-hover:text-[#840562] shrink-0" />
    </span>
  );
}

function NieuweReparatieForm({ modelId, bestaandeCats, onKlaar }: { modelId: number; bestaandeCats: string[]; onKlaar: () => void }) {
  const alleCats = [...new Set([...Object.keys(CAT_LABELS), ...bestaandeCats])];
  const [cat, setCat] = useState(alleCats[0] ?? "overig");
  const [eigenCat, setEigenCat] = useState("");
  const [naam, setNaam] = useState("");
  const [prijs, setPrijs] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function toevoegen() {
    const gekozenCat = cat === "__eigen__" ? eigenCat.trim().toLowerCase().replace(/\s+/g, "-") : cat;
    if (!gekozenCat || !naam.trim() || !prijs) return;
    setSaving(true);
    await fetch("/api/admin/reparatieprijzen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId, cat: gekozenCat, naam: naam.trim(), prijs }),
    });
    setSaving(false);
    onKlaar();
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg">
      <select value={cat} onChange={e => setCat(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
        {alleCats.map(c => <option key={c} value={c}>{CAT_LABELS[c] ?? c}</option>)}
        <option value="__eigen__">+ Eigen categorie…</option>
      </select>
      {cat === "__eigen__" && (
        <input value={eigenCat} onChange={e => setEigenCat(e.target.value)} placeholder="Categorienaam"
          className="border border-gray-300 rounded px-2 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      )}
      <input autoFocus value={naam} onChange={e => setNaam(e.target.value)} placeholder="Naam reparatie"
        className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      <input value={prijs} onChange={e => setPrijs(e.target.value)} placeholder="Prijs" inputMode="numeric"
        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      <button onClick={toevoegen} disabled={saving} className="px-3 py-1.5 bg-[#840562] text-white text-sm font-medium rounded-lg hover:bg-[#6d044f] disabled:opacity-50">
        Toevoegen
      </button>
      <button onClick={onKlaar} className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100"><X size={14} /></button>
    </div>
  );
}

function NieuwToestelForm({ merkId, onKlaar }: { merkId: number; onKlaar: () => void }) {
  const [label, setLabel] = useState("");
  const [groep, setGroep] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function toevoegen() {
    if (!label.trim()) return;
    setSaving(true);
    await fetch("/api/admin/reparatieprijzen/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merkId, label: label.trim(), groep: groep.trim() || undefined }),
    });
    setSaving(false);
    onKlaar();
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-8 py-3 bg-gray-50">
      <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="Naam toestel (bijv. iPhone 16)"
        className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      <input value={groep} onChange={e => setGroep(e.target.value)} placeholder="Groep (optioneel, bijv. iPhone 16 serie)"
        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      <button onClick={toevoegen} disabled={saving} className="px-3 py-1.5 bg-[#840562] text-white text-sm font-medium rounded-lg hover:bg-[#6d044f] disabled:opacity-50">
        Toestel toevoegen
      </button>
      <button onClick={onKlaar} className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100"><X size={14} /></button>
    </div>
  );
}

function NieuwMerkForm({ onKlaar }: { onKlaar: () => void }) {
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function toevoegen() {
    if (!label.trim()) return;
    setSaving(true);
    await fetch("/api/admin/reparatieprijzen/merk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label.trim() }),
    });
    setSaving(false);
    onKlaar();
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-4 bg-white rounded-xl border border-gray-200">
      <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="Naam merk (bijv. Google, OnePlus)"
        onKeyDown={e => { if (e.key === "Enter") toevoegen(); if (e.key === "Escape") onKlaar(); }}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      <button onClick={toevoegen} disabled={saving} className="px-3 py-1.5 bg-[#840562] text-white text-sm font-medium rounded-lg hover:bg-[#6d044f] disabled:opacity-50">
        Merk toevoegen
      </button>
      <button onClick={onKlaar} className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100"><X size={14} /></button>
    </div>
  );
}

export default function ReparatiePrijzenBeheer({ merken }: { merken: Merk[] }) {
  const [openMerk, setOpenMerk] = useState<number | null>(null);
  const [openModel, setOpenModel] = useState<number | null>(null);
  const [zoek, setZoek] = useState("");
  const [nieuwToestelBij, setNieuwToestelBij] = useState<number | null>(null);
  const [nieuweReparatieBij, setNieuweReparatieBij] = useState<number | null>(null);
  const [nieuwMerk, setNieuwMerk] = useState(false);
  const router = useRouter();

  async function hernoemModel(id: number, label: string) {
    await fetch("/api/admin/reparatieprijzen/model", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, label }),
    });
    router.refresh();
  }

  async function hernoemItem(id: number, naam: string) {
    await fetch("/api/admin/reparatieprijzen", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, naam }),
    });
    router.refresh();
  }

  async function verwijderItem(id: number) {
    if (!confirm("Deze reparatie verwijderen?")) return;
    await fetch(`/api/admin/reparatieprijzen?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function verwijderModel(id: number, label: string) {
    if (!confirm(`"${label}" verwijderen, inclusief alle reparaties voor dit toestel?`)) return;
    await fetch(`/api/admin/reparatieprijzen/model?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

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
                    <div className="w-full flex items-center gap-3 px-8 py-3 hover:bg-gray-50 transition-colors">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setOpenModel(openModel === model.id ? null : model.id)}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenModel(openModel === model.id ? null : model.id); } }}
                        className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                      >
                        {openModel === model.id ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                        <TitelCell waarde={model.label} onOpslaan={nieuw => hernoemModel(model.id, nieuw)} className="text-sm font-medium text-gray-700" />
                        {model.groep && <span className="text-xs text-gray-400">{model.groep}</span>}
                      </div>
                      <button onClick={() => verwijderModel(model.id, model.label)} className="p-1 text-gray-300 hover:text-red-600" title="Toestel verwijderen">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {(openModel === model.id || zoek) && (
                      <div className="px-8 pb-3 space-y-3">
                        {Object.entries(cats).map(([cat, items]) => (
                          <div key={cat}>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{CAT_LABELS[cat] ?? cat}</p>
                            <div className="space-y-1">
                              {items.map(item => (
                                <div key={item.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50">
                                  <TitelCell waarde={item.naam} onOpslaan={nieuw => hernoemItem(item.id, nieuw)} className="text-sm text-gray-600" />
                                  <div className="flex items-center gap-2">
                                    <PrijsCell item={item} />
                                    <button onClick={() => verwijderItem(item.id)} className="p-1 text-gray-300 hover:text-red-600" title="Verwijderen">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {nieuweReparatieBij === model.id ? (
                          <NieuweReparatieForm modelId={model.id} bestaandeCats={Object.keys(cats)} onKlaar={() => setNieuweReparatieBij(null)} />
                        ) : (
                          <button onClick={() => setNieuweReparatieBij(model.id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-[#840562] hover:underline">
                            <Plus size={13} /> Reparatie toevoegen
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {nieuwToestelBij === merk.id ? (
                <NieuwToestelForm merkId={merk.id} onKlaar={() => setNieuwToestelBij(null)} />
              ) : (
                <button onClick={() => setNieuwToestelBij(merk.id)}
                  className="w-full flex items-center gap-1.5 px-8 py-3 text-xs font-medium text-[#840562] hover:bg-gray-50 hover:underline text-left">
                  <Plus size={13} /> Toestel toevoegen
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {nieuwMerk ? (
        <NieuwMerkForm onKlaar={() => setNieuwMerk(false)} />
      ) : (
        <button onClick={() => setNieuwMerk(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#840562] hover:underline">
          <Plus size={14} /> Merk toevoegen
        </button>
      )}
    </div>
  );
}
