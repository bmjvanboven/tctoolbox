"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  FileText, Upload, Search, X, Trash2, ExternalLink,
  FolderOpen, Plus, ChevronDown, Lock, Globe, Shield,
} from "lucide-react";

interface Doc {
  id: string;
  naam: string;
  beschrijving?: string | null;
  categorie: string;
  url: string;
  mimetype: string;
  grootte: number;
  toegang: string;
  aangemaakt: string;
  uploadDoor: { name: string };
}

const CATEGORIEEN = [
  "Contracten & formulieren",
  "Reparatiedocumenten",
  "Tarieven & prijzen",
  "Handleidingen",
  "Winkeldocumenten",
  "Overig",
];

const TOEGANG_OPTIES = [
  { value: "IEDEREEN", label: "Iedereen", icon: <Globe size={13} /> },
  { value: "ADMIN", label: "Alleen admins", icon: <Shield size={13} /> },
  { value: "ROL:SHOPMEDEWERKER", label: "Shopmedewerkers", icon: <Lock size={13} /> },
  { value: "ROL:RETENTIEMEDEWERKER", label: "Retentiemedewerkers", icon: <Lock size={13} /> },
];

function bestandsgrootte(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function bestandsIcoon(mime: string) {
  if (mime.includes("pdf")) return "📄";
  if (mime.includes("word") || mime.includes("document")) return "📝";
  if (mime.includes("sheet") || mime.includes("excel")) return "📊";
  if (mime.includes("image")) return "🖼️";
  return "📎";
}

function toegangLabel(toegang: string) {
  return TOEGANG_OPTIES.find(t => t.value === toegang) ?? TOEGANG_OPTIES[0];
}

export default function DocumentenPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";

  const [docs, setDocs] = useState<Doc[]>([]);
  const [zoek, setZoek] = useState("");
  const [actieveCategorie, setActieveCategorie] = useState<string | null>(null);
  const [toonUpload, setToonUpload] = useState(false);
  const [laden, setLaden] = useState(true);

  // Upload form
  const [uploading, setUploading] = useState(false);
  const [bestand, setBestand] = useState<File | null>(null);
  const [naam, setNaam] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [categorie, setCategorie] = useState(CATEGORIEEN[0]);
  const [toegang, setToegang] = useState("IEDEREEN");
  const fileRef = useRef<HTMLInputElement>(null);

  async function laden_() {
    setLaden(true);
    const res = await fetch("/api/documenten");
    if (res.ok) setDocs(await res.json());
    setLaden(false);
  }

  useEffect(() => { laden_(); }, []);

  const gefilterd = docs.filter(d => {
    const matchZoek = !zoek || d.naam.toLowerCase().includes(zoek.toLowerCase()) || d.beschrijving?.toLowerCase().includes(zoek.toLowerCase());
    const matchCat = !actieveCategorie || d.categorie === actieveCategorie;
    return matchZoek && matchCat;
  });

  const perCategorie = CATEGORIEEN.reduce<Record<string, Doc[]>>((acc, cat) => {
    const items = gefilterd.filter(d => d.categorie === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  async function upload() {
    if (!bestand || !naam.trim()) return;
    setUploading(true);

    const form = new FormData();
    form.append("bestand", bestand);
    const up = await fetch("/api/documenten/upload", { method: "POST", body: form });
    if (!up.ok) { setUploading(false); return; }
    const { url, mimetype, grootte } = await up.json();

    await fetch("/api/documenten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: naam.trim(), beschrijving, categorie, url, mimetype, grootte, toegang }),
    });

    setBestand(null); setNaam(""); setBeschrijving(""); setCategorie(CATEGORIEEN[0]); setToegang("IEDEREEN");
    setToonUpload(false);
    setUploading(false);
    laden_();
  }

  async function verwijder(id: string) {
    if (!confirm("Document verwijderen?")) return;
    await fetch(`/api/documenten/${id}`, { method: "DELETE" });
    setDocs(p => p.filter(d => d.id !== id));
  }

  const aantalPerCategorie = CATEGORIEEN.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = docs.filter(d => d.categorie === cat).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={zoek} onChange={e => setZoek(e.target.value)}
            placeholder="Zoek document…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />
          {zoek && <button onClick={() => setZoek("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={13} /></button>}
        </div>
        {isAdmin && (
          <button onClick={() => setToonUpload(true)}
            className="flex items-center gap-2 bg-[#840562] hover:bg-[#6d044f] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Document toevoegen
          </button>
        )}
      </div>

      {/* Categorie tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActieveCategorie(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!actieveCategorie ? "bg-[#840562] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#840562]"}`}>
          Alles ({docs.length})
        </button>
        {CATEGORIEEN.filter(c => aantalPerCategorie[c] > 0).map(cat => (
          <button key={cat} onClick={() => setActieveCategorie(cat === actieveCategorie ? null : cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${actieveCategorie === cat ? "bg-[#840562] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#840562]"}`}>
            {cat} ({aantalPerCategorie[cat]})
          </button>
        ))}
      </div>

      {/* Documenten */}
      {laden ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center text-sm text-gray-400">Laden…</div>
      ) : Object.keys(perCategorie).length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center">
          <FolderOpen size={28} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{zoek ? "Geen documenten gevonden" : "Nog geen documenten — voeg er één toe"}</p>
        </div>
      ) : (
        Object.entries(perCategorie).map(([cat, items]) => (
          <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <FolderOpen size={14} className="text-[#840562]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cat}</span>
              <span className="text-xs text-gray-400 ml-auto">{items.length} {items.length === 1 ? "document" : "documenten"}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map(doc => {
                const toegangInfo = toegangLabel(doc.toegang);
                return (
                  <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 group">
                    <span className="text-xl shrink-0">{bestandsIcoon(doc.mimetype)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.naam}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {doc.beschrijving && <p className="text-xs text-gray-400 truncate">{doc.beschrijving}</p>}
                        <span className={`flex items-center gap-1 text-xs shrink-0 ${doc.toegang === "IEDEREEN" ? "text-gray-400" : "text-amber-600"}`}>
                          {toegangInfo.icon} {toegangInfo.label}
                        </span>
                        <span className="text-xs text-gray-300">{bestandsgrootte(doc.grootte)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-[#840562] rounded-lg hover:bg-purple-50 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                      {isAdmin && (
                        <button onClick={() => verwijder(doc.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Upload modal */}
      {toonUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Document toevoegen</h2>
              <button onClick={() => setToonUpload(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Bestand kiezen */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-colors ${bestand ? "border-[#840562] bg-purple-50" : "border-gray-200 hover:border-[#840562]"}`}>
                <Upload size={20} className={`mx-auto mb-2 ${bestand ? "text-[#840562]" : "text-gray-400"}`} />
                <p className="text-sm text-gray-600">
                  {bestand ? bestand.name : "Klik om bestand te kiezen"}
                </p>
                {bestand && <p className="text-xs text-gray-400 mt-1">{bestandsgrootte(bestand.size)}</p>}
                <input ref={fileRef} type="file" className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setBestand(f); if (!naam) setNaam(f.name.replace(/\.[^.]+$/, "")); }
                  }} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Naam</label>
                <input value={naam} onChange={e => setNaam(e.target.value)} placeholder="Naam van het document"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Beschrijving</label>
                <input value={beschrijving} onChange={e => setBeschrijving(e.target.value)} placeholder="Optioneel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categorie</label>
                  <select value={categorie} onChange={e => setCategorie(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
                    {CATEGORIEEN.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Toegang</label>
                  <select value={toegang} onChange={e => setToegang(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]">
                    {TOEGANG_OPTIES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={upload} disabled={!bestand || !naam.trim() || uploading}
                className="w-full bg-[#840562] hover:bg-[#6d044f] disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-1">
                {uploading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploaden…</> : <><Upload size={14} /> Uploaden</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
