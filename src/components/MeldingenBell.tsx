"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell, X, Send, Info, RefreshCw, Wrench, Lightbulb,
  Newspaper, Zap, AlertTriangle, Star, ChevronDown, StickyNote,
} from "lucide-react";

interface Melding {
  id: string; titel: string; tekst: string; type: string;
  van: string; doel: string; doelRol?: string; aangemaakt: string; gelezen: boolean;
}
interface Gebruiker { id: string; name: string; role: string; }

const TYPES: { value: string; label: string; icon: React.ReactNode; kleur: string; bg: string }[] = [
  { value: "info",      label: "Informatie",  icon: <Info size={14} />,         kleur: "text-blue-600",   bg: "bg-blue-50" },
  { value: "update",    label: "Update",       icon: <RefreshCw size={14} />,    kleur: "text-green-600",  bg: "bg-green-50" },
  { value: "onderhoud", label: "Onderhoud",    icon: <Wrench size={14} />,       kleur: "text-amber-600",  bg: "bg-amber-50" },
  { value: "tip",       label: "Tip",          icon: <Lightbulb size={14} />,    kleur: "text-yellow-600", bg: "bg-yellow-50" },
  { value: "nieuws",    label: "Nieuws",       icon: <Newspaper size={14} />,    kleur: "text-purple-600", bg: "bg-purple-50" },
  { value: "actie",     label: "Actie",        icon: <Zap size={14} />,          kleur: "text-orange-600", bg: "bg-orange-50" },
  { value: "waarschuwing", label: "Waarschuwing", icon: <AlertTriangle size={14} />, kleur: "text-red-600", bg: "bg-red-50" },
  { value: "tip_medewerker", label: "Medewerkertip", icon: <Star size={14} />,      kleur: "text-indigo-600", bg: "bg-indigo-50" },
  { value: "notitie",       label: "Notitie",        icon: <StickyNote size={14} />, kleur: "text-teal-600",  bg: "bg-teal-50" },
];

const ROL_LABELS: Record<string, string> = {
  ADMIN: "Admins", SHOPMEDEWERKER: "Shopmedewerkers", RETENTIEMEDEWERKER: "Retentiemedewerkers",
};

function getTypeMeta(type: string) {
  return TYPES.find(t => t.value === type) ?? TYPES[0];
}

function TypeBadge({ type }: { type: string }) {
  const meta = getTypeMeta(type);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.kleur}`}>
      {meta.icon} {meta.label}
    </span>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "zojuist";
  if (m < 60) return `${m}m geleden`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}u geleden`;
  return `${Math.floor(h / 24)}d geleden`;
}

export default function MeldingenBell() {
  const [open, setOpen] = useState(false);
  const [meldingen, setMeldingen] = useState<Melding[]>([]);
  const [tab, setTab] = useState<"inbox" | "nieuw">("inbox");
  const [gebruikers, setGebruikers] = useState<Gebruiker[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  // Nieuw form
  const [titel, setTitel] = useState("");
  const [tekst, setTekst] = useState("");
  const [type, setType] = useState("info");
  const [doel, setDoel] = useState("IEDEREEN");
  const [doelRol, setDoelRol] = useState("");
  const [doelId, setDoelId] = useState("");
  const [sending, setSending] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const ongelezen = meldingen.filter(m => !m.gelezen).length;

  async function laden() {
    try {
      const res = await fetch("/api/meldingen");
      if (res.ok) setMeldingen(await res.json());
    } catch { /**/ }
  }

  useEffect(() => {
    laden();
    const timer = setInterval(laden, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (open && tab === "nieuw" && gebruikers.length === 0) {
      fetch("/api/gebruikers").then(r => r.json()).then(setGebruikers).catch(() => {});
    }
  }, [open, tab]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markeerGelezen(id: string) {
    await fetch("/api/meldingen/gelezen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meldingId: id }),
    });
    setMeldingen(prev => prev.map(m => m.id === id ? { ...m, gelezen: true } : m));
  }

  async function allesGelezen() {
    await fetch("/api/meldingen/gelezen", { method: "PUT" });
    setMeldingen(prev => prev.map(m => ({ ...m, gelezen: true })));
  }

  async function verstuur() {
    if (!titel.trim() || !tekst.trim()) return;
    setSending(true);
    await fetch("/api/meldingen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titel, tekst, type, doel, doelRol: doel === "ROL" ? doelRol : null, doelId: doel === "GEBRUIKER" ? doelId : null }),
    });
    setTitel(""); setTekst(""); setType("info"); setDoel("IEDEREEN"); setDoelRol(""); setDoelId("");
    setSending(false);
    setTab("inbox");
    laden();
  }

  const selectedType = getTypeMeta(type);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell size={18} />
        {ongelezen > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#840562] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {ongelezen > 9 ? "9+" : ongelezen}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          {/* Header tabs */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex gap-1">
              <button onClick={() => setTab("inbox")} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab === "inbox" ? "bg-[#840562] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                Inbox {ongelezen > 0 && <span className="ml-1 bg-white/30 text-xs px-1.5 rounded-full">{ongelezen}</span>}
              </button>
              <button onClick={() => setTab("nieuw")} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab === "nieuw" ? "bg-[#840562] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                + Nieuw
              </button>
            </div>
            <div className="flex items-center gap-2">
              {tab === "inbox" && ongelezen > 0 && (
                <button onClick={allesGelezen} className="text-xs text-gray-400 hover:text-[#840562]">Alles gelezen</button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
          </div>

          {/* Inbox */}
          {tab === "inbox" ? (
            <div className="overflow-y-auto max-h-[480px]">
              {meldingen.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Geen meldingen</p>
                </div>
              ) : meldingen.map(m => {
                const meta = getTypeMeta(m.type);
                const isOpen = openId === m.id;
                return (
                  <div key={m.id} className={`border-b border-gray-50 transition-colors ${!m.gelezen ? "bg-purple-50/50" : "hover:bg-gray-50"}`}>
                    <button
                      className="w-full text-left px-4 py-3"
                      onClick={() => {
                        setOpenId(isOpen ? null : m.id);
                        if (!m.gelezen) markeerGelezen(m.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Type icon */}
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${meta.bg} ${meta.kleur}`}>
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!m.gelezen && <span className="w-1.5 h-1.5 rounded-full bg-[#840562] shrink-0" />}
                            <p className={`text-sm font-semibold truncate ${!m.gelezen ? "text-gray-900" : "text-gray-600"}`}>{m.titel}</p>
                            <ChevronDown size={13} className={`text-gray-400 shrink-0 transition-transform ml-auto ${isOpen ? "rotate-180" : ""}`} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <TypeBadge type={m.type} />
                            <span className="text-xs text-gray-400">{m.van} · {timeAgo(m.aangemaakt)}</span>
                          </div>
                        </div>
                      </div>
                      {isOpen && (
                        <p className="text-sm text-gray-600 mt-2.5 pl-9 leading-relaxed">{m.tekst}</p>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Nieuw bericht form */
            <div className="p-4 space-y-3 overflow-y-auto max-h-[520px]">
              {/* Type kiezer */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type melding</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                        type === t.value
                          ? `${t.bg} ${t.kleur} border-current ring-2 ring-offset-1 ring-current`
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className={type === t.value ? t.kleur : "text-gray-400"}>{t.icon}</span>
                      <span className="leading-tight text-center">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Titel</label>
                <input value={titel} onChange={e => setTitel(e.target.value)} placeholder="Korte omschrijving…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bericht</label>
                <textarea value={tekst} onChange={e => setTekst(e.target.value)} rows={3} placeholder="Typ je bericht…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#840562]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Aan</label>
                <select value={doel} onChange={e => { setDoel(e.target.value); setDoelRol(""); setDoelId(""); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
                  <option value="IEDEREEN">Iedereen</option>
                  <option value="ROL">Specifieke rol</option>
                  <option value="GEBRUIKER">Specifieke medewerker</option>
                </select>
              </div>

              {doel === "ROL" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rol</label>
                  <select value={doelRol} onChange={e => setDoelRol(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
                    <option value="">Kies rol…</option>
                    {Object.entries(ROL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              )}

              {doel === "GEBRUIKER" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Medewerker</label>
                  <select value={doelId} onChange={e => setDoelId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
                    <option value="">Kies medewerker…</option>
                    {gebruikers.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              )}

              {/* Preview */}
              {(titel || tekst) && (
                <div className={`rounded-xl p-3 ${selectedType.bg} border border-current/20`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={selectedType.kleur}>{selectedType.icon}</span>
                    <span className={`text-xs font-bold ${selectedType.kleur}`}>{selectedType.label}</span>
                  </div>
                  {titel && <p className={`text-sm font-semibold ${selectedType.kleur}`}>{titel}</p>}
                  {tekst && <p className="text-xs text-gray-600 mt-0.5">{tekst}</p>}
                </div>
              )}

              <button onClick={verstuur} disabled={sending || !titel.trim() || !tekst.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#840562] hover:bg-[#6d044f] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                <Send size={14} /> {sending ? "Verzenden…" : "Verstuur melding"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
