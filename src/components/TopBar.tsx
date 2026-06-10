"use client";

import { usePathname } from "next/navigation";
import { useLocatie } from "@/lib/LocatieContext";
import MeldingenBell from "./MeldingenBell";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/tools/adviesformulier": "Adviesformulier",
  "/tools/belscript": "Belscript",
  "/tools/klantentool": "Klantentool",
  "/tools/refurbished-inboek": "Refurbished inboek",
  "/tools/reparatieprijzen": "Reparatieprijzen",
  "/tools/snelkeuzes": "Snelkeuzes",
  "/tools/reparatieplanner": "Reparatieplanner",
  "/admin/gebruikers": "Gebruikers",
  "/admin/tools/snelkeuzes": "Snelkeuzes beheren",
  "/admin/tools/reparatieprijzen": "Reparatieprijzen beheren",
  "/admin/tools/verkoopprijzen": "Verkoopprijzen beheren",
  "/taken": "Taken",
  "/instellingen": "Instellingen",
};

function getLabel(pathname: string): string {
  return routeLabels[pathname] ?? "Toolbox";
}

function formatDate(): string {
  return new Date().toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function TopBar() {
  const pathname = usePathname();
  const { locatie, setLocatie, winkels } = useLocatie();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 gap-4">
      <h1 className="text-base font-semibold text-gray-800 shrink-0">
        {getLabel(pathname)}
      </h1>

      <div className="flex items-center gap-3 ml-auto">
        {/* Locatie selector */}
        <select
          value={locatie}
          onChange={e => setLocatie(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#840562] bg-white"
        >
          <option value="">Locatie kiezen…</option>
          {winkels.map(w => <option key={w} value={w}>{w}</option>)}
        </select>

        {/* Datum */}
        <span className="text-sm text-gray-400 capitalize hidden md:block">
          {formatDate()}
        </span>

        {/* Meldingen bell */}
        <MeldingenBell />
      </div>
    </header>
  );
}
