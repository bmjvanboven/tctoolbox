"use client";

import { useState, useEffect } from "react";
import { Plus, Phone, MessageSquare, RotateCcw, CheckSquare, Circle, CheckCircle2, ChevronDown, Trash2, Pencil, X, Check, Calendar, User, Flag, AlertCircle } from "lucide-react";

const WINKELS = ["Gemert", "Deurne", "Asten", "Geldrop", "Veghel"];

const TASK_TYPES = [
  { value: "bellen",    label: "Klant bellen",       icon: <Phone size={14} />,         kleur: "text-blue-600 bg-blue-50" },
  { value: "whatsapp",  label: "WhatsApp sturen",     icon: <MessageSquare size={14} />, kleur: "text-green-600 bg-green-50" },
  { value: "opvolgen",  label: "Opvolgactie",         icon: <RotateCcw size={14} />,     kleur: "text-purple-600 bg-purple-50" },
  { value: "afvinken",  label: "Afvinken / controle", icon: <CheckSquare size={14} />,   kleur: "text-amber-600 bg-amber-50" },
  { value: "overig",    label: "Overig",              icon: <Circle size={14} />,        kleur: "text-gray-600 bg-gray-100" },
];

const PRIORITEITEN = [
  { value: "hoog",    label: "Hoog",   kleur: "text-red-600 bg-red-50" },
  { value: "normaal", label: "Normaal", kleur: "text-gray-600 bg-gray-100" },
  { value: "laag",    label: "Laag",   kleur: "text-green-600 bg-green-50" },
];

function getType(v: string) { return TASK_TYPES.find(t => t.value === v) ?? TASK_TYPES[4]; }
function getPrioriteit(v: string) { return PRIORITEITEN.find(p => p.value === v) ?? PRIORITEITEN[1]; }

interface Gebruiker { id: string; name: string; role: string; }
interface Taak {
  id: string; titel: string; beschrijving?: string; type: string; prioriteit: string;
  aangemaakt: string; aangemaaaktDoor: { id: string; name: string };
  toegewezenAan?: { id: string; name: string } | null;
  afgerondDoor?: { id: string; name: string } | null;
  locatie?: string | null; afgerond: boolean; afgerondOp?: string | null;
  verloopdatum?: string | null;
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]";

function TaakFormulier({ gebruikers, onOpslaan, onAnnuleer, initieel }: {
  gebruikers: Gebruiker[];
  onOpslaan: (data: Partial<Taak>) => void;
  onAnnuleer: () => void;
  initieel?: Partial<Taak>;
}) {
  const [titel, setTitel] = useState(initieel?.titel ?? "");
  const [beschrijving, setBeschrijving] = useState(initieel?.beschrijving ?? "");
  const [type, setType] = useState(initieel?.type ?? "overig");
  const [prioriteit, setPrioriteit] = useState(initieel?.prioriteit ?? "normaal");
  const [toegewezenAanId, setToegewezenAanId] = useState(initieel?.toegewezenAan?.id ?? "");
  const [locatie, setLocatie] = useState(initieel?.locatie ?? "");
  const [verloopdatum, setVerloopdatum] = useState(
    initieel?.verloopdatum ? new Date(initieel.verloopdatum).toISOString().slice(0, 10) : ""
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titel.trim()) return;
    onOpslaan({ titel, beschrijving, type, prioriteit, toegewezenAan: toegewezenAanId ? { id: toegewezenAanId, name: "" } : null, locatie: locatie || null, verloopdatum: verloopdatum || null });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Titel *</label>
        <input value={titel} onChange={e => setTitel(e.target.value)} required placeholder="Beschrijf de taak…" className={inputClass} autoFocus />
      </div>
      <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Toelichting</label>
        <textarea value={beschrijving} onChange={e => setBeschrijving(e.target.value)} rows={2} placeholder="Optionele extra informatie…" className={`${inputClass} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type taak</label>
          <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
            {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Prioriteit</label>
          <select value={prioriteit} onChange={e => setPrioriteit(e.target.value)} className={inputClass}>
            {PRIORITEITEN.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Toewijzen aan</label>
          <select value={toegewezenAanId} onChange={e => setToegewezenAanId(e.target.value)} className={inputClass}>
            <option value="">Kies medewerker…</option>
            {gebruikers.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Locatie (optioneel)</label>
          <select value={locatie} onChange={e => setLocatie(e.target.value)} className={inputClass}>
            <option value="">Alle locaties</option>
            {WINKELS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Verloopdatum (optioneel)</label>
          <input type="date" value={verloopdatum} onChange={e => setVerloopdatum(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="flex-1 bg-[#840562] hover:bg-[#6d044f] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
          {initieel ? "Opslaan" : "Taak aanmaken"}
        </button>
        <button type="button" onClick={onAnnuleer} className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-lg text-sm transition-colors">
          Annuleren
        </button>
      </div>
    </form>
  );
}

function TaakKaart({ taak, gebruikers, onToggle, onVerwijder, onBewerk }: {
  taak: Taak; gebruikers: Gebruiker[];
  onToggle: (id: string, afgerond: boolean) => void;
  onVerwijder: (id: string) => void;
  onBewerk: (taak: Taak) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const type = getType(taak.type);
  const prio = getPrioriteit(taak.prioriteit);
  const verlopen = taak.verloopdatum && !taak.afgerond && new Date(taak.verloopdatum) < new Date();

  return (
    <div className={`bg-white rounded-xl border transition-all ${taak.afgerond ? "border-gray-100 opacity-70" : verlopen ? "border-red-200" : "border-gray-200"}`}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(taak.id, !taak.afgerond)}
          className={`mt-0.5 shrink-0 transition-colors ${taak.afgerond ? "text-green-500 hover:text-gray-400" : "text-gray-300 hover:text-[#840562]"}`}
        >
          {taak.afgerond ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-semibold ${taak.afgerond ? "line-through text-gray-400" : "text-gray-800"}`}>
                {taak.titel}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${type.kleur}`}>
                  {type.icon} {type.label}
                </span>
                {taak.prioriteit !== "normaal" && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prio.kleur}`}>
                    {prio.label}
                  </span>
                )}
                {taak.locatie && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{taak.locatie}</span>
                )}
                {verlopen && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                    <AlertCircle size={11} /> Verlopen
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onBewerk(taak)} className="p-1.5 text-gray-300 hover:text-[#840562] hover:bg-purple-50 rounded-lg transition-colors"><Pencil size={13} /></button>
              <button onClick={() => onVerwijder(taak.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
              {taak.beschrijving && (
                <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-gray-300 hover:text-gray-600 rounded-lg transition-colors">
                  <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </div>

          {expanded && taak.beschrijving && (
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{taak.beschrijving}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><User size={11} /> {taak.aangemaaaktDoor.name}</span>
            {taak.toegewezenAan && (
              <span className="flex items-center gap-1">→ <strong className="text-gray-600">{taak.toegewezenAan.name}</strong></span>
            )}
            {taak.verloopdatum && !verlopen && (
              <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(taak.verloopdatum).toLocaleDateString("nl-NL")}</span>
            )}
            {taak.afgerond && taak.afgerondDoor && (
              <span className="flex items-center gap-1 text-green-600"><Check size={11} /> Afgerond door {taak.afgerondDoor.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TakenPage() {
  const [taken, setTaken] = useState<Taak[]>([]);
  const [gebruikers, setGebruikers] = useState<Gebruiker[]>([]);
  const [filter, setFilter] = useState<"open" | "afgerond" | "alles">("open");
  const [typeFilter, setTypeFilter] = useState("");
  const [zoek, setZoek] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [bewerkTaak, setBewerkTaak] = useState<Taak | null>(null);
  const [loading, setLoading] = useState(true);

  async function laden() {
    const res = await fetch("/api/taken");
    if (res.ok) setTaken(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    laden();
    fetch("/api/gebruikers").then(r => r.json()).then(setGebruikers).catch(() => {});
  }, []);

  async function aanmaken(data: Partial<Taak>) {
    const res = await fetch("/api/taken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, toegewezenAanId: data.toegewezenAan?.id }),
    });
    if (res.ok) { const t = await res.json(); setTaken(prev => [t, ...prev]); setShowForm(false); }
  }

  async function bewerken(data: Partial<Taak>) {
    if (!bewerkTaak) return;
    const res = await fetch(`/api/taken/${bewerkTaak.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, toegewezenAanId: data.toegewezenAan?.id }),
    });
    if (res.ok) { const t = await res.json(); setTaken(prev => prev.map(x => x.id === t.id ? t : x)); setBewerkTaak(null); }
  }

  async function toggleAfgerond(id: string, afgerond: boolean) {
    const res = await fetch(`/api/taken/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ afgerond }),
    });
    if (res.ok) { const t = await res.json(); setTaken(prev => prev.map(x => x.id === t.id ? t : x)); }
  }

  async function verwijder(id: string) {
    if (!confirm("Taak definitief verwijderen?")) return;
    const res = await fetch(`/api/taken/${id}`, { method: "DELETE" });
    if (res.ok) setTaken(prev => prev.filter(x => x.id !== id));
  }

  const gefilterd = taken.filter(t => {
    if (filter === "open" && t.afgerond) return false;
    if (filter === "afgerond" && !t.afgerond) return false;
    if (typeFilter && t.type !== typeFilter) return false;
    if (zoek && !t.titel.toLowerCase().includes(zoek.toLowerCase()) && !t.beschrijving?.toLowerCase().includes(zoek.toLowerCase())) return false;
    return true;
  });

  const aantalOpen = taken.filter(t => !t.afgerond).length;
  const aantalAfgerond = taken.filter(t => t.afgerond).length;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {([["open", `Open (${aantalOpen})`], ["afgerond", `Afgerond (${aantalAfgerond})`], ["alles", "Alles"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setBewerkTaak(null); }}
          className="flex items-center gap-2 bg-[#840562] hover:bg-[#6d044f] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus size={16} /> Nieuwe taak
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input value={zoek} onChange={e => setZoek(e.target.value)} placeholder="Zoek taak…"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] bg-white w-48" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] bg-white">
          <option value="">Alle types</option>
          {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Formulier nieuw / bewerken */}
      {(showForm || bewerkTaak) && (
        <div className="bg-white rounded-2xl border border-[#840562]/30 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">{bewerkTaak ? "Taak bewerken" : "Nieuwe taak aanmaken"}</h2>
          <TaakFormulier
            gebruikers={gebruikers}
            initieel={bewerkTaak ?? undefined}
            onOpslaan={bewerkTaak ? bewerken : aanmaken}
            onAnnuleer={() => { setShowForm(false); setBewerkTaak(null); }}
          />
        </div>
      )}

      {/* Takenlijst */}
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-12">Taken laden…</div>
      ) : gefilterd.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <CheckCircle2 size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{filter === "open" ? "Geen openstaande taken 🎉" : "Geen taken gevonden"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gefilterd.map(taak => (
            bewerkTaak?.id === taak.id ? null :
            <TaakKaart
              key={taak.id}
              taak={taak}
              gebruikers={gebruikers}
              onToggle={toggleAfgerond}
              onVerwijder={verwijder}
              onBewerk={t => { setBewerkTaak(t); setShowForm(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
