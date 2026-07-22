"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Check, X, Plus, Trash2, Pencil } from "lucide-react";

type Prijs = { id: number; gb: number; grade: string; prijs: number; innamePrijs: number | null };
type Model = { id: number; naam: string; onderdelenInname: number | null; prijzen: Prijs[] };

const GRADES = ["A", "B", "C"];
const GRADE_LABELS: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };

function gradeKleur(grade: string) {
  if (grade === "A") return "bg-green-100 text-green-700";
  if (grade === "B") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

function InnamePrijsCell({ prijs, onVerwijderen }: { prijs: Prijs; onVerwijderen: () => void }) {
  const [editing, setEditing] = useState(false);
  const [waarde, setWaarde] = useState(String(prijs.innamePrijs ?? ""));
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function opslaan() {
    setSaving(true);
    await fetch("/api/admin/verkoopprijzen", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prijs.id, innamePrijs: waarde === "" ? null : waarde }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) return (
    <div className="flex items-center gap-1 justify-center">
      <span className="text-xs text-gray-400">€</span>
      <input autoFocus value={waarde} onChange={e => setWaarde(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") opslaan(); if (e.key === "Escape") setEditing(false); }}
        className="w-16 border border-[#840562] rounded px-1.5 py-1 text-sm text-right focus:outline-none" />
      <button onClick={opslaan} disabled={saving} className="p-1 bg-[#840562] text-white rounded hover:bg-[#6d044f]"><Check size={11} /></button>
      <button onClick={() => setEditing(false)} className="p-1 border border-gray-300 rounded hover:bg-gray-50"><X size={11} /></button>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1">
        <button onClick={() => setEditing(true)} className="text-sm font-bold text-gray-800 hover:text-[#840562] hover:underline cursor-pointer px-1">
          {prijs.innamePrijs !== null ? `€ ${prijs.innamePrijs}` : <span className="text-gray-300 font-normal">— instellen</span>}
        </button>
        <button onClick={onVerwijderen} className="p-0.5 text-gray-300 hover:text-red-600" title="Rij verwijderen"><Trash2 size={12} /></button>
      </div>
      <span className="text-[11px] text-gray-400">verkoop € {prijs.prijs}</span>
    </div>
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
    <span onClick={e => { e.stopPropagation(); setEditing(true); }}
      className={`group inline-flex items-center gap-1.5 cursor-pointer hover:text-[#840562] ${className ?? ""}`}>
      {initieleWaarde}
      <Pencil size={11} className="text-gray-300 group-hover:text-[#840562] shrink-0" />
    </span>
  );
}

function OnderdelenInnameCell({ modelId, waarde }: { modelId: number; waarde: number | null }) {
  const [editing, setEditing] = useState(false);
  const [invoer, setInvoer] = useState(String(waarde ?? ""));
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function opslaan() {
    setSaving(true);
    await fetch("/api/admin/verkoopprijzen/model", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: modelId, onderdelenInname: invoer === "" ? null : invoer }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      <span className="text-xs text-gray-400">€</span>
      <input autoFocus value={invoer} onChange={e => setInvoer(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") opslaan(); if (e.key === "Escape") setEditing(false); }}
        className="w-16 border border-[#840562] rounded px-1.5 py-1 text-sm text-right focus:outline-none" />
      <button onClick={opslaan} disabled={saving} className="p-1 bg-[#840562] text-white rounded hover:bg-[#6d044f]"><Check size={11} /></button>
      <button onClick={() => setEditing(false)} className="p-1 border border-gray-300 rounded hover:bg-gray-50"><X size={11} /></button>
    </div>
  );

  return (
    <button onClick={e => { e.stopPropagation(); setEditing(true); }}
      className="text-xs font-medium text-gray-500 hover:text-[#840562] hover:underline cursor-pointer">
      Onderdelen inname: <span className="font-bold">{waarde !== null ? `€ ${waarde}` : "— instellen"}</span>
    </button>
  );
}

function NieuweRijForm({ modelId, onKlaar }: { modelId: number; onKlaar: () => void }) {
  const [gb, setGb] = useState("");
  const [grade, setGrade] = useState("A");
  const [prijs, setPrijs] = useState("");
  const [innamePrijs, setInnamePrijs] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function toevoegen() {
    if (!gb || !grade || !prijs) return;
    setSaving(true);
    await fetch("/api/admin/verkoopprijzen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId, gb, grade, prijs, innamePrijs: innamePrijs || undefined }),
    });
    setSaving(false);
    onKlaar();
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg">
      <input value={gb} onChange={e => setGb(e.target.value)} placeholder="GB (bijv. 128)" inputMode="numeric"
        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      <select value={grade} onChange={e => setGrade(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
        {GRADES.map(g => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
      </select>
      <input value={innamePrijs} onChange={e => setInnamePrijs(e.target.value)} placeholder="Innameprijs" inputMode="numeric"
        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      <input value={prijs} onChange={e => setPrijs(e.target.value)} placeholder="Verkoopprijs" inputMode="numeric"
        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-[#840562]" />
      <button onClick={toevoegen} disabled={saving} className="px-3 py-1.5 bg-[#840562] text-white text-sm font-medium rounded-lg hover:bg-[#6d044f] disabled:opacity-50">
        Toevoegen
      </button>
      <button onClick={onKlaar} className="px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100"><X size={14} /></button>
    </div>
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

export default function InkoopPrijzenBeheer({ modellen }: { modellen: Model[] }) {
  const [zoek, setZoek] = useState("");
  const [openModel, setOpenModel] = useState<number | null>(null);
  const [nieuwToestel, setNieuwToestel] = useState(false);
  const [nieuweRijBij, setNieuweRijBij] = useState<number | null>(null);
  const router = useRouter();

  const gefilterd = zoek ? modellen.filter(m => m.naam.toLowerCase().includes(zoek.toLowerCase())) : modellen;

  async function hernoemModel(id: number, naam: string) {
    await fetch("/api/admin/verkoopprijzen/model", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, naam }),
    });
    router.refresh();
  }

  async function verwijderModel(id: number, naam: string) {
    if (!confirm(`"${naam}" volledig verwijderen, inclusief alle in- en verkoopprijzen?`)) return;
    await fetch(`/api/admin/verkoopprijzen/model?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function verwijderRij(id: number) {
    if (!confirm("Deze prijsregel verwijderen?")) return;
    await fetch(`/api/admin/verkoopprijzen?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <input value={zoek} onChange={e => setZoek(e.target.value)} placeholder="Zoek toestel…"
        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />

      <div className="space-y-3">
        {gefilterd.map(model => {
          const perGb: Record<number, Prijs[]> = {};
          for (const p of model.prijzen) (perGb[p.gb] ??= []).push(p);
          const open = openModel === model.id;

          return (
            <div key={model.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenModel(open ? null : model.id)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenModel(open ? null : model.id); } }}
                  className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                >
                  {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                  <TitelCell waarde={model.naam} onOpslaan={naam => hernoemModel(model.id, naam)} className="text-sm font-bold text-gray-800" />
                </div>
                <OnderdelenInnameCell modelId={model.id} waarde={model.onderdelenInname} />
                <button onClick={() => verwijderModel(model.id, model.naam)} className="p-1 text-gray-300 hover:text-red-600" title="Toestel verwijderen">
                  <Trash2 size={14} />
                </button>
              </div>

              {open && (
                <div className="border-t border-gray-100 px-5 py-3 space-y-3">
                  {Object.keys(perGb).length === 0 ? (
                    <p className="text-sm text-gray-400">Nog geen prijzen voor dit toestel.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left px-2 py-2 text-xs font-semibold text-gray-400">Opslag</th>
                            {GRADES.map(g => (
                              <th key={g} className="text-center px-3 py-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeKleur(g)}`}>{GRADE_LABELS[g]}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {Object.entries(perGb).sort(([a], [b]) => Number(a) - Number(b)).map(([gb, prijzen]) => (
                            <tr key={gb}>
                              <td className="px-2 py-2.5 font-medium text-gray-700">{gb} GB</td>
                              {GRADES.map(g => {
                                const p = prijzen.find(x => x.grade === g);
                                return (
                                  <td key={g} className="px-3 py-2.5 text-center">
                                    {p ? <InnamePrijsCell prijs={p} onVerwijderen={() => verwijderRij(p.id)} /> : <span className="text-gray-300">—</span>}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {nieuweRijBij === model.id ? (
                    <NieuweRijForm modelId={model.id} onKlaar={() => setNieuweRijBij(null)} />
                  ) : (
                    <button onClick={() => setNieuweRijBij(model.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#840562] hover:underline">
                      <Plus size={13} /> Opslag/grade toevoegen
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
