"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSidebar } from "@/lib/SidebarContext";

const groepen = [
  {
    label: "Klant",
    items: [
      { href: "/tools/klantentool", label: "Klantentool" },
      { href: "/tools/adviesformulier", label: "Adviesformulier" },
      { href: "/tools/belscript", label: "Belscript" },
    ],
  },
  {
    label: "Reparatie",
    items: [
      { href: "/tools/reparatieprijzen", label: "Reparatieprijzen" },
      { href: "/tools/refurbished-inboek", label: "Toestel inname" },
      { href: "/tools/reparatieplanner", label: "Reparatieplanner", disabled: true },
    ],
  },
  {
    label: "Overig",
    items: [
      { href: "/tools/snelkeuzes", label: "Snelkeuzes" },
    ],
  },
];

function useCount(url: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function laden() {
      try {
        const res = await fetch(url);
        if (res.ok) { const d = await res.json(); setCount(d.count); }
      } catch { /**/ }
    }
    laden();
    const timer = setInterval(laden, 30000);
    return () => clearInterval(timer);
  }, [url]);

  return count;
}

function useTakenCount() { return useCount("/api/taken/count"); }
function useMarketingCount() { return useCount("/api/marketing/count"); }

function GroepNav({ label, defaultOpen, children }: { label: string; defaultOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-purple-400/80 uppercase tracking-widest hover:text-purple-200 transition-colors"
      >
        {label}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";
  const takenCount = useTakenCount();
  const marketingCount = useMarketingCount();

  const linkClass = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
      active
        ? "bg-white/20 text-white font-medium"
        : "text-purple-100 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <Link href="/" onClick={onNavigate} className={linkClass(pathname === "/")}>
          Dashboard
        </Link>

        <Link href="/documenten" onClick={onNavigate} className={linkClass(pathname === "/documenten")}>
          Documenten
        </Link>

        <Link
          href="/marketing"
          onClick={onNavigate}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/marketing"
              ? "bg-white/20 text-white font-medium"
              : "text-purple-100 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span>Marketing</span>
          {marketingCount > 0 && (
            <span className="bg-[#ef8400] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
              {marketingCount > 99 ? "99+" : marketingCount}
            </span>
          )}
        </Link>

        <Link
          href="/taken"
          onClick={onNavigate}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/taken"
              ? "bg-white/20 text-white font-medium"
              : "text-purple-100 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span>Taken</span>
          {takenCount > 0 && (
            <span className="bg-[#ef8400] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
              {takenCount > 99 ? "99+" : takenCount}
            </span>
          )}
        </Link>

        <div className="border-t border-[#6d044f] my-2" />

        {groepen.map(groep => {
          const actief = groep.items.some(i => pathname === i.href);
          return (
            <GroepNav key={groep.label} label={groep.label} defaultOpen={groep.label === "Klant" || groep.label === "Reparatie" || actief}>
              {groep.items.map(item => (
                item.disabled
                  ? <span key={item.href} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-purple-200/40 cursor-not-allowed select-none">
                      {item.label}
                      <span className="text-[10px] bg-white/10 text-purple-300/60 px-1.5 py-0.5 rounded-full">binnenkort</span>
                    </span>
                  : <Link key={item.href} href={item.href} onClick={onNavigate} className={linkClass(pathname === item.href)}>
                      {item.label}
                    </Link>
              ))}
            </GroepNav>
          );
        })}

        {isAdmin && (
          <>
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider px-2 mt-6 mb-2">
              Beheer
            </p>
            <Link
              href="/admin/gebruikers"
              onClick={onNavigate}
              className={linkClass(pathname.startsWith("/admin/gebruikers"))}
            >
              Gebruikers
            </Link>
            {[
              { href: "/admin/tools/snelkeuzes", label: "Snelkeuzes" },
              { href: "/admin/tools/reparatieprijzen", label: "Reparatieprijzen" },
              { href: "/admin/tools/verkoopprijzen", label: "Verkoopprijzen" },
              { href: "/admin/audit-log", label: "Audit log" },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={onNavigate}
                className={linkClass(pathname === item.href)}>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-[#6d044f]">
        <Link href="/instellingen" onClick={onNavigate} className="px-3 py-2 mb-1 rounded-lg hover:bg-white/10 transition-colors block">
          <p className="text-sm font-medium text-white truncate">{session?.user.name}</p>
          <p className="text-xs text-purple-300 capitalize">
            {session?.user.role?.toLowerCase().replace("_", " ")}
          </p>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-purple-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          Uitloggen
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 h-screen bg-[#840562] flex-col shrink-0 overflow-y-auto sticky top-0">
        <div className="px-5 py-5 border-b border-[#6d044f]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-wit.png" alt="Telecombinatie" width={160} />
        </div>
        <SidebarNav />
      </aside>

      {/* Mobiel: overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobiel: drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#840562] flex flex-col md:hidden transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#6d044f]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-tctoolbox-mobiel.png" alt="Telecombinatie" width={40} />
          <button
            onClick={() => setOpen(false)}
            className="text-white p-1 rounded hover:bg-white/10"
            aria-label="Menu sluiten"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </aside>
    </>
  );
}
