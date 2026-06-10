"use client";

import { useState, useEffect } from "react";
import { StickyNote, X, Plus, Trash2, Building2, User, Check, UserCheck, ChevronDown } from "lucide-react";
import { useLocatie } from "@/lib/LocatieContext";

interface Notitie {
  id: string;
  tekst: string;
  type: string;
  locatie?: string | null;
  eigenaar: { name: string };
  toegewezenAan?: { name: string } | null;
  bijgewerkt: string;
}
interface Gebruiker { id: string; name: string; }

type Tab = "persoonlijk" | "vestiging" | "toegewezen";

function formatDatum(d: string) {
  return new Date(d).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function NotitiePaneel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("persoonlijk");
  const [notities, setNotities] = useState<Notitie[]>([]);
  const [gebruikers, setGebruikers] = useState<Gebruiker[]>([]);
  const [toegewezenAantalBadge, setToegewezenAantal] = useState(0);
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bewerkTekst, setBewerkTekst] = useState("");

  // Nieuw formulier
  const [nieuwTekst, setNieuwTekst] = useState("");
  const [nieuwToewijzen, setNieuwToewijzen] = useState(false);
  const [nieuwGebruikerId, setNieuwGebruikerId] = useState("");

  const { locatie } = useLocatie();

  async function laden(huidigTab = tab) {
    const params = huidigTab === "vestiging" && locatie
      ? `?type=vestiging&locatie=${encodeURIComponent(locatie)}`
      : `?type=${huidigTab}`;
    const res = await fetch(`/api/notities${params}`);
    if (res.ok) setNotities(await res.json());

    // Badge count voor toegewezen
    const r2 = await fetch("/api/notities?type=toegewezen");
    if (r2.ok) { const d = await r2.json(); setToegewezenAantal(d.length); }
  }

  useEffect(() => {
    if (open) {
      laden();
      fetch("/api/gebruikers").then(r => r.json()).then(setGebruikers).catch(() => {});
    }
  }, [open, tab, locatie]);

  // Badge laden bij mount (ook als paneel dicht is)
  useEffect(() => {
    fetch("/api/notities?type=toegewezen").then(r => r.json()).then((d: Notitie[]) => setToegewezenAantal(d.length)).catch(() => {});
  }, []);

  async function toevoegen() {
    if (!nieuwTekst.trim()) return;
    await fetch("/api/notities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tekst: nieuwTekst,
        type: tab === "vestiging" ? "vestiging" : "persoonlijk",
        locatie: tab === "vestiging" ? locatie : null,
        toegewezenAanId: nieuwToewijzen && nieuwGebruikerId ? nieuwGebruikerId : null,
      }),
    });
    setNieuwTekst(""); setNieuwToewijzen(false); setNieuwGebruikerId("");
    laden();
  }

  async function opslaan(id: string) {
    if (!bewerkTekst.trim()) return;
    await fetch(`/api/notities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tekst: bewerkTekst }),
    });
    setBewerkId(null);
    laden();
  }

  async function verwijder(id: string) {
    await fetch(`/api/notities/${id}`, { method: "DELETE" });
    setNotities(prev => prev.filter(n => n.id !== id));
    setToegewezenAantal(prev => Math.max(0, prev - 1));
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "persoonlijk", label: "Persoonlijk", icon: <User size={12} /> },
    { id: "vestiging",   label: locatie || "Vestiging", icon: <Building2 size={12} /> },
    { id: "toegewezen",  label: "Toegewezen", icon: <UserCheck size={12} />, badge: toegewezenAantalBadge },
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg font-semibold text-sm transition-all ${
          open ? "bg-gray-700 text-white" : "bg-[#840562] hover:bg-[#6d044f] text-white"
        }`}
      >
        <StickyNote size={16} />
        <span>Notities</span>
        {!open && toegewezenAantalBadge > 0 && (
          <span className="bg-white/30 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{toegewezenAantalBadge}</span>
        )}
      </button>

      {/* Paneel */}
      {open && (
        <div className="fixed bottom-20 right-4 md:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden max-h-[75vh]">
          {/* Header tabs */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
            <div className="flex gap-1">
              {tabs.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); laden(t.id); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors relative ${
                    tab === t.id ? "bg-[#840562] text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {t.icon} {t.label}
                  {t.badge && t.badge > 0 && tab !== t.id && (
                    <span className="absolute -top-1 -right-1 bg-[#840562] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{t.badge}</span>
                  )}
                </button>
              ))}
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={15} /></button>
          </div>

          {/* Vestiging waarschuwing */}
          {tab === "vestiging" && !locatie && (
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
              Kies een locatie in de topbalk om vestigingsnotities te zien.
            </div>
          )}

          {/* Toegewezen info */}
          {tab === "toegewezen" && (
            <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 text-xs text-teal-700">
              Notities die door collega's aan jou zijn toegewezen.
            </div>
          )}

          {/* Notities lijst */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {notities.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                <StickyNote size={24} className="mx-auto mb-2 text-gray-200" />
                Nog geen notities
              </div>
            ) : notities.map(n => (
              <div key={n.id} className="px-4 py-3 hover:bg-gray-50 group">
                {bewerkId === n.id ? (
                  <div className="space-y-2">
                    <textarea value={bewerkTekst} onChange={e => setBewerkTekst(e.target.value)}
                      rows={3} autoFocus
                      className="w-full border border-[#840562] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none" />
                    <div className="flex gap-2">
                      <button onClick={() => opslaan(n.id)}
                        className="flex items-center gap-1 bg-[#840562] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                        <Check size={12} /> Opslaan
                      </button>
                      <button onClick={() => setBewerkId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2">Annuleren</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed cursor-pointer"
                      onClick={() => { if (tab !== "toegewezen") { setBewerkId(n.id); setBewerkTekst(n.tekst); } }}>
                      {n.tekst}
                    </p>
                    {n.toegewezenAan && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <UserCheck size={11} className="text-teal-500" />
                        <span className="text-xs text-teal-600 font-medium">Toegewezen aan {n.toegewezenAan.name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-400">
                        {(tab === "vestiging" || tab === "toegewezen") ? `${n.eigenaar.name} · ` : ""}
                        {formatDatum(n.bijgewerkt)}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        {tab !== "toegewezen" && (
                          <button onClick={() => { setBewerkId(n.id); setBewerkTekst(n.tekst); }}
                            className="p-1 text-gray-400 hover:text-[#840562]"><StickyNote size={12} /></button>
                        )}
                        <button onClick={() => verwijder(n.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Nieuwe notitie invoer (niet op toegewezen tab) */}
          {tab !== "toegewezen" && (
            <div className="border-t border-gray-100 px-4 py-3 space-y-2">
              <div className="flex gap-2">
                <textarea
                  value={nieuwTekst}
                  onChange={e => setNieuwTekst(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); toevoegen(); } }}
                  rows={2}
                  placeholder={tab === "vestiging" ? "Vestigingsnotitie…" : "Notitie schrijven…"}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#840562]"
                />
                <button onClick={toevoegen} disabled={!nieuwTekst.trim()}
                  className="bg-[#840562] hover:bg-[#6d044f] disabled:opacity-40 text-white p-2.5 rounded-lg transition-colors self-end">
                  <Plus size={16} />
                </button>
              </div>

              {/* Toewijzen toggle */}
              <button
                onClick={() => setNieuwToewijzen(v => !v)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#840562] transition-colors"
              >
                <UserCheck size={13} />
                Toewijzen aan collega
                <ChevronDown size={12} className={`transition-transform ${nieuwToewijzen ? "rotate-180" : ""}`} />
              </button>

              {nieuwToewijzen && (
                <select
                  value={nieuwGebruikerId}
                  onChange={e => setNieuwGebruikerId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]"
                >
                  <option value="">Kies collega…</option>
                  {gebruikers.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              )}

              {nieuwToewijzen && nieuwGebruikerId && (
                <p className="text-xs text-teal-600 bg-teal-50 rounded-lg px-2.5 py-1.5">
                  ✓ Collega ontvangt automatisch een melding
                </p>
              )}

              <p className="text-xs text-gray-400">Enter om op te slaan · Shift+Enter voor nieuwe regel</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
