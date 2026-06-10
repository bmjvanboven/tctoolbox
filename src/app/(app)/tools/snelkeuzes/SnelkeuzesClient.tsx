"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { SnelkeuzeGroep, SnelkeuzeNummer } from "@prisma/client";

type GroepMetNummers = SnelkeuzeGroep & { nummers: SnelkeuzeNummer[] };

function KopieerKnop({ waarde }: { waarde: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);

  async function kopieer() {
    await navigator.clipboard.writeText(waarde);
    setGekopieerd(true);
    setTimeout(() => setGekopieerd(false), 1500);
  }

  return (
    <button
      onClick={kopieer}
      className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-[#840562] transition-colors px-2 py-1 rounded-md hover:bg-purple-50"
    >
      {gekopieerd ? (
        <>
          <Check size={13} className="text-green-500" />
          <span className="text-green-500">Gekopieerd</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          Kopieer
        </>
      )}
    </button>
  );
}

export default function SnelkeuzesClient({ groepen }: { groepen: GroepMetNummers[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groepen.map((groep) => (
        <div key={groep.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <span className="text-2xl font-bold text-[#840562]">{groep.code}</span>
            <span className="font-semibold text-gray-700">{groep.naam}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {groep.nummers.map((nr) => (
              <div key={nr.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors">
                <span className="text-base font-bold text-gray-700 w-10 shrink-0">{nr.code}</span>
                <span className="text-sm text-gray-500">{nr.naam}</span>
                <KopieerKnop waarde={String(nr.code)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
