"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus, X, Check } from "lucide-react";
import type { SnelkeuzeGroep, SnelkeuzeNummer } from "@prisma/client";

type GroepMetNummers = SnelkeuzeGroep & { nummers: SnelkeuzeNummer[] };

export default function SnelkeuzeBeheer({ groepen }: { groepen: GroepMetNummers[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<number[]>([]);
  const [nieuweGroep, setNieuweGroep] = useState(false);
  const [editGroep, setEditGroep] = useState<SnelkeuzeGroep | null>(null);
  const [editNummer, setEditNummer] = useState<SnelkeuzeNummer | null>(null);
  const [nieuwNummer, setNieuwNummer] = useState<number | null>(null);

  function toggleOpen(id: number) {
    setOpen((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function verwijderGroep(id: number) {
    if (!confirm("Groep en alle nummers verwijderen?")) return;
    await fetch(`/api/admin/snelkeuzes?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function verwijderNummer(id: number) {
    if (!confirm("Nummer verwijderen?")) return;
    await fetch(`/api/admin/snelkeuzes/nummer?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {groepen.map((groep) => (
        <div key={groep.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Groep header */}
          <div className="flex items-center gap-3 px-5 py-4">
            <button onClick={() => toggleOpen(groep.id)} className="text-gray-400 hover:text-gray-600">
              {open.includes(groep.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {editGroep?.id === groep.id ? (
              <GroepEditForm groep={editGroep} onDone={() => { setEditGroep(null); router.refresh(); }} />
            ) : (
              <>
                <span className="text-xl font-bold text-[#840562]">{groep.code}</span>
                <span className="font-semibold text-gray-700 flex-1">{groep.naam}</span>
                <span className="text-xs text-gray-400">{groep.nummers.length} nummers</span>
                <button onClick={() => setEditGroep(groep)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                  <Pencil size={15} />
                </button>
                <button onClick={() => verwijderGroep(groep.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>

          {/* Nummers */}
          {open.includes(groep.id) && (
            <div className="border-t border-gray-100">
              <div className="divide-y divide-gray-50">
                {groep.nummers.map((nr) => (
                  <div key={nr.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50">
                    {editNummer?.id === nr.id ? (
                      <NummerEditForm nummer={editNummer} onDone={() => { setEditNummer(null); router.refresh(); }} />
                    ) : (
                      <>
                        <span className="font-bold text-gray-700 w-10">{nr.code}</span>
                        <span className="text-sm text-gray-500 flex-1">{nr.naam}</span>
                        <button onClick={() => setEditNummer(nr)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => verwijderNummer(nr.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Nieuw nummer */}
              <div className="px-5 py-3 border-t border-gray-50">
                {nieuwNummer === groep.id ? (
                  <NieuwNummerForm groepId={groep.id} onDone={() => { setNieuwNummer(null); router.refresh(); }} />
                ) : (
                  <button
                    onClick={() => setNieuwNummer(groep.id)}
                    className="flex items-center gap-1.5 text-sm text-[#840562] hover:text-[#6d044f] font-medium"
                  >
                    <Plus size={15} /> Nummer toevoegen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Nieuwe groep */}
      <div className="bg-white rounded-xl border border-dashed border-gray-300 overflow-hidden">
        {nieuweGroep ? (
          <div className="px-5 py-4">
            <NieuweGroepForm onDone={() => { setNieuweGroep(false); router.refresh(); }} />
          </div>
        ) : (
          <button
            onClick={() => setNieuweGroep(true)}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 text-sm font-medium text-gray-400 hover:text-[#840562] hover:bg-purple-50 transition-colors"
          >
            <Plus size={16} /> Nieuwe groep toevoegen
          </button>
        )}
      </div>
    </div>
  );
}

function GroepEditForm({ groep, onDone }: { groep: SnelkeuzeGroep; onDone: () => void }) {
  const [code, setCode] = useState(String(groep.code));
  const [naam, setNaam] = useState(groep.naam);

  async function opslaan() {
    await fetch("/api/admin/snelkeuzes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: groep.id, code, naam }),
    });
    onDone();
  }

  return (
    <div className="flex items-center gap-2 flex-1">
      <input value={code} onChange={(e) => setCode(e.target.value)} className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold" placeholder="Code" />
      <input value={naam} onChange={(e) => setNaam(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="Naam" />
      <button onClick={opslaan} className="p-1.5 bg-[#840562] text-white rounded-lg hover:bg-[#6d044f]"><Check size={14} /></button>
      <button onClick={onDone} className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"><X size={14} /></button>
    </div>
  );
}

function NieuweGroepForm({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState("");
  const [naam, setNaam] = useState("");

  async function opslaan() {
    await fetch("/api/admin/snelkeuzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, naam }),
    });
    onDone();
  }

  return (
    <div className="flex items-center gap-2">
      <input value={code} onChange={(e) => setCode(e.target.value)} className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="Code" />
      <input value={naam} onChange={(e) => setNaam(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="Naam groep" />
      <button onClick={opslaan} className="p-1.5 bg-[#840562] text-white rounded-lg hover:bg-[#6d044f]"><Check size={14} /></button>
      <button onClick={onDone} className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"><X size={14} /></button>
    </div>
  );
}

function NummerEditForm({ nummer, onDone }: { nummer: SnelkeuzeNummer; onDone: () => void }) {
  const [code, setCode] = useState(String(nummer.code));
  const [naam, setNaam] = useState(nummer.naam);

  async function opslaan() {
    await fetch("/api/admin/snelkeuzes/nummer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: nummer.id, code, naam }),
    });
    onDone();
  }

  return (
    <div className="flex items-center gap-2 flex-1">
      <input value={code} onChange={(e) => setCode(e.target.value)} className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold" placeholder="Code" />
      <input value={naam} onChange={(e) => setNaam(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="Naam" />
      <button onClick={opslaan} className="p-1.5 bg-[#840562] text-white rounded-lg hover:bg-[#6d044f]"><Check size={14} /></button>
      <button onClick={onDone} className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"><X size={14} /></button>
    </div>
  );
}

function NieuwNummerForm({ groepId, onDone }: { groepId: number; onDone: () => void }) {
  const [code, setCode] = useState("");
  const [naam, setNaam] = useState("");

  async function opslaan() {
    await fetch("/api/admin/snelkeuzes/nummer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groepId, code, naam }),
    });
    onDone();
  }

  return (
    <div className="flex items-center gap-2">
      <input value={code} onChange={(e) => setCode(e.target.value)} className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="Code" />
      <input value={naam} onChange={(e) => setNaam(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="Naam" />
      <button onClick={opslaan} className="p-1.5 bg-[#840562] text-white rounded-lg hover:bg-[#6d044f]"><Check size={14} /></button>
      <button onClick={onDone} className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"><X size={14} /></button>
    </div>
  );
}
