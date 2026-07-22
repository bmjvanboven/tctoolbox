"use client";

import { useEffect, useState } from "react";
import { Target, Send, Trophy, CheckCircle2, XCircle } from "lucide-react";

const MAX_POGINGEN = 5;

interface VandaagResponse {
  gespeeld: boolean;
  afgerond: boolean;
  opgelost: boolean;
  aantalWoorden: number | null;
  woordenGetoond: number;
  woorden: string[];
  gokken: string[];
  onderwerp?: string;
}

interface LeaderboardRij {
  naam: string;
  locatie: string | null;
  aantalWoorden: number;
  jij: boolean;
}

export default function PinpointPage() {
  const [laden, setLaden] = useState(true);
  const [staat, setStaat] = useState<VandaagResponse | null>(null);
  const [gok, setGok] = useState("");
  const [versturen, setVersturen] = useState(false);
  const [foutmelding, setFoutmelding] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardRij[] | null>(null);

  async function haalStaatOp() {
    const res = await fetch("/api/spellen/pinpoint/vandaag");
    if (res.ok) setStaat(await res.json());
    setLaden(false);
  }

  async function haalLeaderboardOp() {
    const res = await fetch("/api/spellen/pinpoint/leaderboard");
    if (res.ok) setLeaderboard((await res.json()).leaderboard);
  }

  useEffect(() => {
    haalStaatOp();
    haalLeaderboardOp();
  }, []);

  async function versuurGok(e: React.FormEvent) {
    e.preventDefault();
    if (!gok.trim() || versturen || staat?.afgerond) return;
    setVersturen(true);
    setFoutmelding("");
    try {
      const res = await fetch("/api/spellen/pinpoint/gok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gok }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFoutmelding(data.error ?? "Er ging iets mis.");
        return;
      }
      setStaat(prev => ({
        gespeeld: true,
        afgerond: data.afgerond,
        opgelost: data.opgelost,
        aantalWoorden: data.aantalWoorden,
        woordenGetoond: data.woordenGetoond,
        woorden: data.woorden,
        gokken: [...(prev?.gokken ?? []), gok],
        onderwerp: data.onderwerp,
      }));
      setGok("");
      if (data.afgerond) haalLeaderboardOp();
    } finally {
      setVersturen(false);
    }
  }

  if (laden) {
    return <div className="text-sm text-gray-400">Puzzel laden...</div>;
  }

  if (!staat) {
    return <div className="text-sm text-gray-400">Kon de puzzel niet laden. Probeer het opnieuw.</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Target size={18} className="text-gray-400" />
        <div>
          <h1 className="text-lg font-bold text-gray-800">Merk Pinpoint</h1>
          <p className="text-sm text-gray-400">
            Raad het merk, product of begrip. Elke foute gok onthult een extra woord — hoe minder woorden, hoe beter.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="space-y-2">
          {Array.from({ length: MAX_POGINGEN }).map((_, i) => {
            const woord = staat.woorden[i];
            const isGetoond = i < staat.woorden.length;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
                  isGetoond ? "border-gray-100 bg-gray-50" : "border-dashed border-gray-200"
                }`}
              >
                <span className={`w-5 h-5 shrink-0 rounded-full text-xs font-bold flex items-center justify-center ${
                  isGetoond ? "bg-[#840562] text-white" : "bg-gray-100 text-gray-300"
                }`}>
                  {i + 1}
                </span>
                <span className={`text-sm ${isGetoond ? "text-gray-700 font-medium" : "text-gray-300"}`}>
                  {isGetoond ? woord : "?"}
                </span>
              </div>
            );
          })}
        </div>

        {staat.afgerond ? (
          <div className={`rounded-xl px-4 py-3 flex items-start gap-2 text-sm ${
            staat.opgelost ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {staat.opgelost ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <XCircle size={16} className="shrink-0 mt-0.5" />}
            <span>
              {staat.opgelost
                ? `Goed! Je raadde "${staat.onderwerp}" in ${staat.aantalWoorden} ${staat.aantalWoorden === 1 ? "woord" : "woorden"}.`
                : `Helaas, dit was 'm: "${staat.onderwerp}". Morgen weer een nieuwe puzzel.`}
            </span>
          </div>
        ) : (
          <form onSubmit={versuurGok} className="flex gap-2">
            <input
              value={gok}
              onChange={e => setGok(e.target.value)}
              placeholder="Jouw antwoord..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]"
              autoFocus
            />
            <button
              type="submit"
              disabled={versturen || !gok.trim()}
              className="bg-[#840562] text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={14} /> Gok
            </button>
          </form>
        )}

        {foutmelding && <p className="text-xs text-red-500">{foutmelding}</p>}

        {staat.gokken.length > 0 && !staat.afgerond && (
          <p className="text-xs text-gray-400">
            Eerdere gokken: {staat.gokken.join(", ")}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
          <Trophy size={14} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Leaderboard vandaag</h3>
        </div>
        {!leaderboard || leaderboard.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400">
            Nog niemand heeft de puzzel van vandaag opgelost. Wees de eerste!
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {leaderboard.map((rij, i) => (
              <li
                key={`${rij.naam}-${i}`}
                className={`flex items-center gap-3 px-5 py-3 ${rij.jij ? "bg-purple-50/60" : ""}`}
              >
                <span className="w-5 text-xs font-bold text-gray-400 shrink-0">{i + 1}</span>
                <span className="text-sm text-gray-700 flex-1">
                  {rij.naam}{rij.jij && <span className="text-[#840562]"> (jij)</span>}
                </span>
                {rij.locatie && (
                  <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full shrink-0">{rij.locatie}</span>
                )}
                <span className="text-xs text-gray-400 shrink-0">
                  {rij.aantalWoorden} {rij.aantalWoorden === 1 ? "woord" : "woorden"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
