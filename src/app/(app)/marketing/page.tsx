"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Megaphone, Plus, X, ChevronRight, CheckCircle2, Clock, Package,
  Trash2, MapPin, Image as ImageIcon, Upload,
} from "lucide-react";

interface Aanvraag {
  id: string;
  aanvragerId: string;
  filiaal: string;
  status: string;
  aangemaakt: string;
}

interface Materiaal {
  id: string;
  titel: string;
  beschrijving?: string | null;
  categorie: string;
  afbeeldingUrls: string[];
  filiaalBasis?: string | null;
  aangemaakt: string;
  aangemaaktDoor: { id: string; name: string };
  aanvragen: Aanvraag[];
}

const CATEGORIEEN = ["Cadeaubon", "Actie", "Flyer", "Poster", "Social media", "Overig"];

const STATUS_CONFIG: Record<string, { label: string; kleur: string; icon: React.ReactNode }> = {
  aangevraagd: { label: "Aangevraagd", kleur: "bg-amber-100 text-amber-700", icon: <Clock size={11} /> },
  in_productie: { label: "In productie", kleur: "bg-blue-100 text-blue-700", icon: <Package size={11} /> },
  geleverd: { label: "Geleverd", kleur: "bg-green-100 text-green-700", icon: <CheckCircle2 size={11} /> },
};

const FILIALEN = [
  "Geldrop", "Eindhoven", "Helmond", "Weert", "Venlo", "Roermond", "Maastricht", "Sittard",
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.aangevraagd;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.kleur}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function MarketingPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";

  const [materialen, setMaterialen] = useState<Materiaal[]>([]);
  const [laden, setLaden] = useState(true);
  const [actieveCategorie, setActieveCategorie] = useState<string | null>(null);

  // Toevoegen (admin)
  const [toonToevoegen, setToonToevoegen] = useState(false);
  const [nieuweAfbeeldingen, setNieuweAfbeeldingen] = useState<File[]>([]);
  const [nieuweTitel, setNieuweTitel] = useState("");
  const [nieuweBeschrijving, setNieuweBeschrijving] = useState("");
  const [nieuweCategorie, setNieuweCategorie] = useState(CATEGORIEEN[0]);
  const [nieuwFiliaalBasis, setNieuwFiliaalBasis] = useState("");
  const [opslaan, setOpslaan] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Aanvragen
  const [aanvraagMateriaal, setAanvraagMateriaal] = useState<Materiaal | null>(null);
  const [aanvraagFiliaal, setAanvraagFiliaal] = useState(session?.user.name ? "" : "");
  const [aanvraagOpmerking, setAanvraagOpmerking] = useState("");
  const [aanvraagBezig, setAanvraagBezig] = useState(false);
  const [aanvraagGedaan, setAanvraagGedaan] = useState<Set<string>>(new Set());

  // Detailweergave
  const [detailMateriaal, setDetailMateriaal] = useState<Materiaal | null>(null);
  const [actieveFoto, setActieveFoto] = useState(0);

  async function haalOp() {
    setLaden(true);
    const res = await fetch("/api/marketing");
    if (res.ok) {
      const data: Materiaal[] = await res.json();
      setMaterialen(data);
      // Bijhouden welke al aangevraagd zijn door huidige user
      const userId = session?.user.id;
      if (userId) {
        const gedaan = new Set(
          data.flatMap(m => m.aanvragen.filter(a => a.aanvragerId === userId).map(() => m.id))
        );
        setAanvraagGedaan(gedaan);
      }
    }
    setLaden(false);
  }

  useEffect(() => {
    haalOp();
    // Markeer alle materialen als gezien zodat het badge verdwijnt
    fetch("/api/marketing/gezien", { method: "POST" });
  }, [session?.user.id]);

  // Prefill filiaal vanuit user locatie
  useEffect(() => {
    if (session?.user) {
      const locatie = (session.user as { locatie?: string }).locatie;
      if (locatie) setAanvraagFiliaal(locatie);
    }
  }, [session]);

  const gefilterd = materialen.filter(m =>
    !actieveCategorie || m.categorie === actieveCategorie
  );

  const categorieenMetItems = CATEGORIEEN.filter(c => materialen.some(m => m.categorie === c));

  async function voegToe() {
    if (!nieuweTitel.trim()) return;
    setOpslaan(true);

    // Upload afbeeldingen naar Vercel Blob via documenten upload route
    const geuploadUrls: string[] = [];
    for (const file of nieuweAfbeeldingen) {
      const form = new FormData();
      form.append("bestand", file);
      const res = await fetch("/api/documenten/upload", { method: "POST", body: form });
      if (res.ok) {
        const { url } = await res.json();
        geuploadUrls.push(url);
      }
    }

    const res = await fetch("/api/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titel: nieuweTitel.trim(),
        beschrijving: nieuweBeschrijving.trim() || null,
        categorie: nieuweCategorie,
        afbeeldingUrls: geuploadUrls,
        filiaalBasis: nieuwFiliaalBasis.trim() || null,
      }),
    });

    if (res.ok) {
      setToonToevoegen(false);
      setNieuweTitel("");
      setNieuweBeschrijving("");
      setNieuweCategorie(CATEGORIEEN[0]);
      setNieuwFiliaalBasis("");
      setNieuweAfbeeldingen([]);
      haalOp();
    }
    setOpslaan(false);
  }

  async function verwijder(id: string) {
    if (!confirm("Materiaal verwijderen?")) return;
    await fetch(`/api/marketing/${id}`, { method: "DELETE" });
    setMaterialen(p => p.filter(m => m.id !== id));
    if (detailMateriaal?.id === id) setDetailMateriaal(null);
  }

  async function vraagAan() {
    if (!aanvraagMateriaal || !aanvraagFiliaal) return;
    setAanvraagBezig(true);
    const res = await fetch(`/api/marketing/${aanvraagMateriaal.id}/aanvraag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filiaal: aanvraagFiliaal, opmerking: aanvraagOpmerking }),
    });
    if (res.ok) {
      setAanvraagGedaan(p => new Set([...p, aanvraagMateriaal.id]));
      setAanvraagMateriaal(null);
      setAanvraagOpmerking("");
      haalOp();
    }
    setAanvraagBezig(false);
  }

  async function wijzigStatus(materiaalId: string, aanvraagId: string, status: string) {
    await fetch(`/api/marketing/${materiaalId}/aanvraag`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aanvraagId, status }),
    });
    haalOp();
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Megaphone size={20} className="text-[#840562]" /> Marketing
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Materialen aanvragen voor jouw vestiging</p>
        </div>
        {isAdmin && (
          <button onClick={() => setToonToevoegen(true)}
            className="flex items-center gap-2 bg-[#840562] hover:bg-[#6d044f] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Materiaal toevoegen
          </button>
        )}
      </div>

      {/* Categorie tabs */}
      {categorieenMetItems.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActieveCategorie(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!actieveCategorie ? "bg-[#840562] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#840562]"}`}>
            Alles ({materialen.length})
          </button>
          {categorieenMetItems.map(cat => (
            <button key={cat} onClick={() => setActieveCategorie(cat === actieveCategorie ? null : cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${actieveCategorie === cat ? "bg-[#840562] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#840562]"}`}>
              {cat} ({materialen.filter(m => m.categorie === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {laden ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-16 text-center text-sm text-gray-400">Laden…</div>
      ) : gefilterd.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-16 text-center">
          <Megaphone size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Nog geen marketingmaterialen</p>
          {isAdmin && (
            <button onClick={() => setToonToevoegen(true)}
              className="mt-4 text-sm text-[#840562] hover:underline">
              Voeg het eerste materiaal toe
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gefilterd.map(mat => {
            const heeftAangevraagd = aanvraagGedaan.has(mat.id);
            const eigenAanvraag = mat.aanvragen.find(a => a.aanvragerId === session?.user.id);
            return (
              <div key={mat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                {/* Afbeelding preview */}
                <div
                  className="relative h-48 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => { setDetailMateriaal(mat); setActieveFoto(0); }}>
                  {mat.afbeeldingUrls.length > 0 ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mat.afbeeldingUrls[0]}
                        alt={mat.titel}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {mat.afbeeldingUrls.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                          +{mat.afbeeldingUrls.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <ImageIcon size={32} className="text-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="text-xs font-medium text-[#840562] bg-purple-50 px-2 py-0.5 rounded-full">{mat.categorie}</span>
                    </div>
                    {mat.filiaalBasis && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={10} /> {mat.filiaalBasis}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-gray-800 mt-2 mb-1">{mat.titel}</h3>
                  {mat.beschrijving && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{mat.beschrijving}</p>
                  )}

                  {/* Aanvragen status of knop */}
                  {eigenAanvraag ? (
                    <div className="flex items-center justify-between">
                      <StatusBadge status={eigenAanvraag.status} />
                      {isAdmin && (
                        <select
                          value={eigenAanvraag.status}
                          onChange={e => wijzigStatus(mat.id, eigenAanvraag.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#840562]"
                          onClick={e => e.stopPropagation()}>
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => { setAanvraagMateriaal(mat); }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#840562] hover:bg-[#6d044f] text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                        Aanvragen voor mijn vestiging <ChevronRight size={12} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => verwijder(mat.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Admin: overzicht aanvragen */}
                  {isAdmin && mat.aanvragen.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Aanvragen ({mat.aanvragen.length})
                      </p>
                      <div className="space-y-1.5">
                        {mat.aanvragen.map(a => (
                          <div key={a.id} className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-600 truncate">{a.filiaal}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <StatusBadge status={a.status} />
                              <select
                                value={a.status}
                                onChange={e => wijzigStatus(mat.id, a.id, e.target.value)}
                                className="text-xs border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#840562]">
                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                  <option key={key} value={key}>{cfg.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {detailMateriaal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDetailMateriaal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">{detailMateriaal.titel}</h2>
              <button onClick={() => setDetailMateriaal(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            {detailMateriaal.afbeeldingUrls.length > 0 && (
              <div className="bg-gray-50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detailMateriaal.afbeeldingUrls[actieveFoto]}
                  alt={detailMateriaal.titel}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
                {detailMateriaal.afbeeldingUrls.length > 1 && (
                  <div className="flex gap-2 mt-3 justify-center">
                    {detailMateriaal.afbeeldingUrls.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={url} src={url} alt="" onClick={() => setActieveFoto(i)}
                        className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 transition-all ${i === actieveFoto ? "border-[#840562]" : "border-transparent opacity-60 hover:opacity-100"}`} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="px-5 py-4 flex items-center justify-between">
              {detailMateriaal.filiaalBasis && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={11} /> Gemaakt voor {detailMateriaal.filiaalBasis}
                </span>
              )}
              {!aanvraagGedaan.has(detailMateriaal.id) && (
                <button
                  onClick={() => { setAanvraagMateriaal(detailMateriaal); setDetailMateriaal(null); }}
                  className="flex items-center gap-1.5 bg-[#840562] hover:bg-[#6d044f] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors ml-auto">
                  Aanvragen voor mijn vestiging <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aanvraag modal */}
      {aanvraagMateriaal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Aanvragen</h2>
                <p className="text-xs text-gray-400 mt-0.5">{aanvraagMateriaal.titel}</p>
              </div>
              <button onClick={() => setAanvraagMateriaal(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Jouw vestiging</label>
                <select
                  value={aanvraagFiliaal}
                  onChange={e => setAanvraagFiliaal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
                  <option value="">Kies vestiging…</option>
                  {FILIALEN.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Opmerking (optioneel)</label>
                <textarea
                  value={aanvraagOpmerking}
                  onChange={e => setAanvraagOpmerking(e.target.value)}
                  placeholder="Bijv. specifieke kleur, formaat, etc."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] resize-none" />
              </div>

              <button
                onClick={vraagAan}
                disabled={!aanvraagFiliaal || aanvraagBezig}
                className="w-full bg-[#840562] hover:bg-[#6d044f] disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                {aanvraagBezig ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Versturen…</>
                ) : (
                  <><CheckCircle2 size={15} /> Aanvraag versturen</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toevoegen modal (admin) */}
      {toonToevoegen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-sm font-semibold text-gray-800">Materiaal toevoegen</h2>
              <button onClick={() => setToonToevoegen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Afbeeldingen */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Afbeeldingen</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition-colors ${nieuweAfbeeldingen.length > 0 ? "border-[#840562] bg-purple-50" : "border-gray-200 hover:border-[#840562]"}`}>
                  <Upload size={18} className={`mx-auto mb-1.5 ${nieuweAfbeeldingen.length > 0 ? "text-[#840562]" : "text-gray-400"}`} />
                  <p className="text-sm text-gray-500">
                    {nieuweAfbeeldingen.length > 0 ? `${nieuweAfbeeldingen.length} afbeelding${nieuweAfbeeldingen.length > 1 ? "en" : ""} geselecteerd` : "Klik om afbeeldingen te kiezen"}
                  </p>
                  <input ref={fileRef} type="file" className="hidden" accept="image/*" multiple
                    onChange={e => setNieuweAfbeeldingen(Array.from(e.target.files ?? []))} />
                </div>
                {nieuweAfbeeldingen.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {nieuweAfbeeldingen.map((f, i) => (
                      <div key={i} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Titel</label>
                <input value={nieuweTitel} onChange={e => setNieuweTitel(e.target.value)}
                  placeholder="Bijv. Cadeaubon Geldrop"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Beschrijving</label>
                <textarea value={nieuweBeschrijving} onChange={e => setNieuweBeschrijving(e.target.value)}
                  placeholder="Optioneel — korte uitleg over het materiaal"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categorie</label>
                  <select value={nieuweCategorie} onChange={e => setNieuweCategorie(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
                    {CATEGORIEEN.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Origineel filiaal</label>
                  <select value={nieuwFiliaalBasis} onChange={e => setNieuwFiliaalBasis(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
                    <option value="">Geen / algemeen</option>
                    {FILIALEN.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={voegToe} disabled={!nieuweTitel.trim() || opslaan}
                className="w-full bg-[#840562] hover:bg-[#6d044f] disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-1">
                {opslaan ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Opslaan…</>
                ) : (
                  <><Plus size={14} /> Toevoegen</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
