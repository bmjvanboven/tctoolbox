"use client";

import { useState, useRef } from "react";
import { Printer } from "lucide-react";

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]";

interface Optie {
  maandprijs: string;
  internet: string;
  tv: string;
  looptijd: string;
  opmerking: string;
}

function leegOptie(): Optie {
  return { maandprijs: "", internet: "", tv: "", looptijd: "24", opmerking: "" };
}

export default function AdviesformulierPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const [klant, setKlant]     = useState({ naam: "", telefoon: "", email: "" });
  const [huidig, setHuidig]   = useState({ provider: "", maandprijs: "", einddatum: "", toestel: "" });
  const [optie1, setOptie1]   = useState<Optie>(leegOptie());
  const [optie2, setOptie2]   = useState<Optie>(leegOptie());

  const formNr = `TC-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,"0")}${String(new Date().getDate()).padStart(2,"0")}`;

  function handlePrint() { window.print(); }

  const fmt = (v: string) => v ? `€ ${v}/mnd` : "—";

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400">Formuliernummer: <span className="font-mono font-medium">{formNr}</span></p>
        <button onClick={handlePrint}
          className="flex items-center gap-2 bg-[#840562] hover:bg-[#6d044f] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Printer size={15} /> Afdrukken / PDF
        </button>
      </div>

      <div ref={printRef} className="space-y-5 print:space-y-4">
        {/* Klantgegevens */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Klantgegevens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Naam</label>
              <input value={klant.naam} onChange={e => setKlant({...klant, naam: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Telefoonnummer</label>
              <input value={klant.telefoon} onChange={e => setKlant({...klant, telefoon: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
              <input value={klant.email} onChange={e => setKlant({...klant, email: e.target.value})} className={inputClass} /></div>
          </div>
        </section>

        {/* Huidige situatie */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Huidige situatie</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Provider</label>
              <input value={huidig.provider} onChange={e => setHuidig({...huidig, provider: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Maandprijs (€)</label>
              <input type="number" value={huidig.maandprijs} onChange={e => setHuidig({...huidig, maandprijs: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Einddatum contract</label>
              <input type="date" value={huidig.einddatum} onChange={e => setHuidig({...huidig, einddatum: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Huidig toestel</label>
              <input value={huidig.toestel} onChange={e => setHuidig({...huidig, toestel: e.target.value})} className={inputClass} /></div>
          </div>
        </section>

        {/* Opties */}
        {([["Optie 1 — Verlenging", optie1, setOptie1], ["Optie 2 — Overstap", optie2, setOptie2]] as const).map(([titel, optie, setOptie]) => (
          <section key={titel} className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">{titel}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Maandprijs (€)</label>
                <input type="number" value={optie.maandprijs} onChange={e => setOptie({...optie, maandprijs: e.target.value})} className={inputClass} /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Internet (GB/onbeperkt)</label>
                <input value={optie.internet} onChange={e => setOptie({...optie, internet: e.target.value})} placeholder="bijv. Onbeperkt" className={inputClass} /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">TV</label>
                <input value={optie.tv} onChange={e => setOptie({...optie, tv: e.target.value})} placeholder="bijv. Standaard" className={inputClass} /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Looptijd (mnd)</label>
                <select value={optie.looptijd} onChange={e => setOptie({...optie, looptijd: e.target.value})} className={inputClass}>
                  <option value="1">1 maand</option>
                  <option value="12">12 maanden</option>
                  <option value="24">24 maanden</option>
                </select></div>
              <div className="sm:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Opmerking</label>
                <input value={optie.opmerking} onChange={e => setOptie({...optie, opmerking: e.target.value})} className={inputClass} /></div>
            </div>
          </section>
        ))}

        {/* Vergelijking */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Vergelijkingsoverzicht</h2>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {[
              { label: "Huidig", prijs: huidig.maandprijs, extra: huidig.provider },
              { label: "Optie 1", prijs: optie1.maandprijs, extra: optie1.internet, looptijd: optie1.looptijd },
              { label: "Optie 2", prijs: optie2.maandprijs, extra: optie2.internet, looptijd: optie2.looptijd },
            ].map(item => {
              const besparing = huidig.maandprijs && item.prijs
                ? parseFloat(huidig.maandprijs) - parseFloat(item.prijs) : null;
              return (
                <div key={item.label} className="p-5 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                  <p className="text-2xl font-black text-[#840562]">{fmt(item.prijs)}</p>
                  {item.extra && <p className="text-xs text-gray-500 mt-1">{item.extra}</p>}
                  {item.looptijd && <p className="text-xs text-gray-400">{item.looptijd} mnd</p>}
                  {besparing !== null && item.label !== "Huidig" && (
                    <p className={`text-xs font-bold mt-2 ${besparing > 0 ? "text-green-600" : besparing < 0 ? "text-red-600" : "text-gray-400"}`}>
                      {besparing > 0 ? `▼ € ${besparing.toFixed(2)}/mnd goedkoper` : besparing < 0 ? `▲ € ${Math.abs(besparing).toFixed(2)}/mnd duurder` : "Zelfde prijs"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Handtekening blok */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Handtekening</h2>
          <div className="grid grid-cols-2 gap-6">
            {["Klant", "Adviseur"].map(label => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-2">{label}</p>
                <div className="border-b-2 border-gray-300 h-16" />
                <p className="text-xs text-gray-300 mt-1">Datum: _______________</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}
