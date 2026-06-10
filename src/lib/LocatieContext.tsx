"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

const WINKELS = ["Gemert", "Deurne", "Asten", "Geldrop", "Veghel"];

interface LocatieCtx {
  locatie: string;
  setLocatie: (l: string) => void;
  winkels: string[];
  geladen: boolean;
}

const LocatieContext = createContext<LocatieCtx>({
  locatie: "", setLocatie: () => {}, winkels: WINKELS, geladen: false,
});

export function LocatieProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [locatie, setLocatieState] = useState("");
  const [geladen, setGeladen] = useState(false);
  const [toonModal, setToonModal] = useState(false);
  const [keuze, setKeuze] = useState("");

  // Wacht tot sessie bevestigd is, dan pas ophalen
  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/locatie")
      .then(r => r.json())
      .then(d => {
        if (d.locatie) {
          setLocatieState(d.locatie);
        } else {
          setToonModal(true);
        }
      })
      .catch(() => { /* stil negeren */ })
      .finally(() => setGeladen(true));
  }, [status]);

  async function setLocatie(l: string) {
    setLocatieState(l);
    await fetch("/api/locatie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locatie: l }),
    });
  }

  async function bevestigLocatie() {
    if (!keuze) return;
    setToonModal(false);
    await setLocatie(keuze);
  }

  return (
    <LocatieContext.Provider value={{ locatie, setLocatie, winkels: WINKELS, geladen }}>
      {children}

      {toonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Kies je locatie</h2>
            <p className="text-sm text-gray-500 mb-5">
              Vanuit welke winkel werk je vandaag?
            </p>

            <div className="grid grid-cols-1 gap-2 mb-6">
              {WINKELS.map(w => (
                <button
                  key={w}
                  onClick={() => setKeuze(w)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    keuze === w
                      ? "bg-[#840562] border-[#840562] text-white"
                      : "border-gray-200 text-gray-700 hover:border-[#840562] hover:text-[#840562]"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            <button
              onClick={bevestigLocatie}
              disabled={!keuze}
              className="w-full bg-[#840562] text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-40 hover:bg-[#6d044f] transition-colors"
            >
              Bevestigen
            </button>
          </div>
        </div>
      )}
    </LocatieContext.Provider>
  );
}

export function useLocatie() { return useContext(LocatieContext); }
