"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const tools = [
  { href: "/tools/adviesformulier", label: "Adviesformulier" },
  { href: "/tools/belscript", label: "Belscript" },
  { href: "/tools/klantentool", label: "Klantentool" },
  { href: "/tools/refurbished-inboek", label: "Refurbished inboek" },
  { href: "/tools/reparatieprijzen", label: "Reparatieprijzen" },
  { href: "/tools/snelkeuzes", label: "Snelkeuzes" },
  { href: "/tools/reparatieplanner", label: "Reparatieplanner" },
];

function useTakenCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function laden() {
      try {
        const res = await fetch("/api/taken/count");
        if (res.ok) { const d = await res.json(); setCount(d.count); }
      } catch { /**/ }
    }
    laden();
    const timer = setInterval(laden, 30000);
    return () => clearInterval(timer);
  }, []);

  return count;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";
  const takenCount = useTakenCount();

  return (
    <aside className="w-60 min-h-screen bg-[#840562] flex flex-col">
      <div className="px-5 py-5 border-b border-[#6d044f]">
        
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-wit.png" alt="Telecombinatie" width={160} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/"
              ? "bg-white/20 text-white font-medium"
              : "text-purple-100 hover:bg-white/10 hover:text-white"
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/taken"
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

        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === tool.href
                ? "bg-white/20 text-white font-medium"
                : "text-purple-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tool.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider px-2 mt-6 mb-2">
              Beheer
            </p>
            <Link
              href="/admin/gebruikers"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname.startsWith("/admin/gebruikers")
                  ? "bg-white/20 text-white font-medium"
                  : "text-purple-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              Gebruikers
            </Link>
            {[
              { href: "/admin/tools/snelkeuzes", label: "Snelkeuzes" },
              { href: "/admin/tools/reparatieprijzen", label: "Reparatieprijzen" },
              { href: "/admin/tools/verkoopprijzen", label: "Verkoopprijzen" },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href ? "bg-white/20 text-white font-medium" : "text-purple-100 hover:bg-white/10 hover:text-white"
                }`}>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-[#6d044f]">
        <Link href="/instellingen" className="px-3 py-2 mb-1 rounded-lg hover:bg-white/10 transition-colors block">
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
    </aside>
  );
}
