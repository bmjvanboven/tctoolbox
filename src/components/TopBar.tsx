"use client";

import { usePathname } from "next/navigation";
import { useLocatie } from "@/lib/LocatieContext";
import { useSidebar } from "@/lib/SidebarContext";
import MeldingenBell from "./MeldingenBell";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/tools/adviesformulier": "Adviesformulier",
  "/tools/belscript": "Belscript",
  "/tools/klantentool": "Klantentool",
  "/tools/refurbished-inboek": "Toestel inname",
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
  const { setOpen } = useSidebar();

  return (
    <header className="fixed md:relative top-0 left-0 right-0 z-30 md:z-auto h-14 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 flex-shrink-0 gap-3">
      {/* Hamburger — alleen zichtbaar op mobiel */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden text-gray-600 p-1 rounded hover:bg-gray-100 shrink-0"
        aria-label="Menu openen"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 className="text-base font-semibold text-gray-800 shrink-0">
        {getLabel(pathname)}
      </h1>

      <div className="flex items-center gap-3 ml-auto">
        {/* Locatie selector */}
        <select
          value={locatie}
          onChange={e => setLocatie(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#840562] bg-white max-w-[140px] md:max-w-none"
        >
          <option value="">Locatie…</option>
          {winkels.map(w => <option key={w} value={w}>{w}</option>)}
        </select>

        {/* Datum — alleen op desktop */}
        <span className="text-sm text-gray-400 capitalize hidden md:block">
          {formatDate()}
        </span>

        <MeldingenBell />
      </div>
    </header>
  );
}
