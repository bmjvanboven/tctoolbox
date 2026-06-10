import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ClipboardList, Phone, Users, Smartphone, Wrench,
  Zap, CalendarClock, CheckSquare, Bell, StickyNote, ArrowRight, ChevronRight,
} from "lucide-react";

const tools = [
  {
    href: "/tools/adviesformulier",
    label: "Adviesformulier",
    beschrijving: "Adviesformulier voor de klant",
    icon: ClipboardList,
    accent: "#840562",
    bg: "bg-purple-50",
    status: "live",
  },
  {
    href: "/tools/belscript",
    label: "Belscript",
    beschrijving: "Scripts voor telefooncontact",
    icon: Phone,
    accent: "#ef8400",
    bg: "bg-orange-50",
    status: "live",
  },
  {
    href: "/tools/klantentool",
    label: "Klantentool",
    beschrijving: "Berichten & abonnementen",
    icon: Users,
    accent: "#00a7de",
    bg: "bg-sky-50",
    status: "live",
  },
  {
    href: "/tools/refurbished-inboek",
    label: "Toestel inname",
    beschrijving: "Toestellen inboeken",
    icon: Smartphone,
    accent: "#840562",
    bg: "bg-purple-50",
    status: "live",
  },
  {
    href: "/tools/reparatieprijzen",
    label: "Reparatieprijzen",
    beschrijving: "Prijzen voor reparaties",
    icon: Wrench,
    accent: "#ef8400",
    bg: "bg-orange-50",
    status: "live",
  },
  {
    href: "/tools/snelkeuzes",
    label: "Snelkeuzes",
    beschrijving: "Veelgebruikte acties en links",
    icon: Zap,
    accent: "#00a7de",
    bg: "bg-sky-50",
    status: "live",
  },
  {
    href: "/tools/reparatieplanner",
    label: "Reparatieplanner",
    beschrijving: "Reparaties inplannen",
    icon: CalendarClock,
    accent: "#840562",
    bg: "bg-purple-50",
    status: "ontwikkeling",
  },
];

function daggroet(voornaam: string) {
  const uur = new Date().getHours();
  if (uur < 12) return { tekst: `Goedemorgen, ${voornaam}`, emoji: "☀️" };
  if (uur < 18) return { tekst: `Goedemiddag, ${voornaam}`, emoji: "👋" };
  return { tekst: `Goedenavond, ${voornaam}`, emoji: "🌙" };
}

export default async function HomePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, openTaken, ongelezen, recenteNotities, urgenteTaken] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.taak.count({ where: { toegewezenAanId: userId, afgerond: false } }),
    prisma.melding.count({
      where: {
        gelezen: { none: { userId } },
        OR: [
          { doel: "IEDEREEN" },
          { doel: "ROL", doelRol: session!.user.role },
          { doel: "GEBRUIKER", doelId: userId },
        ],
      },
    }),
    prisma.notitie.findMany({
      where: { eigenaarId: userId, gearchiveerd: false },
      orderBy: { bijgewerkt: "desc" },
      take: 3,
      select: { id: true, tekst: true, bijgewerkt: true, type: true },
    }),
    prisma.taak.findMany({
      where: { toegewezenAanId: userId, afgerond: false, prioriteit: "hoog" },
      orderBy: { aangemaakt: "asc" },
      take: 3,
      select: { id: true, titel: true, locatie: true, verloopdatum: true },
    }),
  ]);

  const voornaam = user?.voornaam || session?.user.name?.split(" ")[0] || "";
  const groet = daggroet(voornaam);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative bg-[#840562] rounded-2xl overflow-hidden">
        {/* Decoratieve cirkels */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-0 right-24 w-32 h-32 rounded-full bg-[#ef8400]/20" />
        <div className="absolute top-4 right-4 text-3xl opacity-60 select-none">{groet.emoji}</div>

        <div className="relative px-6 py-6">
          <h2 className="text-2xl font-black text-white mb-1">{groet.tekst}!</h2>
          <p className="text-purple-200 text-sm">
            {openTaken === 0
              ? "Geen openstaande taken. Lekker bezig!"
              : `Je hebt ${openTaken} openstaande ${openTaken === 1 ? "taak" : "taken"}.`}
          </p>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 border-t border-white/10">
          <Link href="/taken" className="flex flex-col items-center py-4 hover:bg-white/5 transition-colors group">
            <span className="text-2xl font-black text-white">{openTaken}</span>
            <span className="text-xs text-purple-300 mt-0.5 flex items-center gap-1">
              <CheckSquare size={11} /> Taken
            </span>
          </Link>
          <div className="flex flex-col items-center py-4 border-x border-white/10">
            <span className="text-2xl font-black text-white">{ongelezen}</span>
            <span className="text-xs text-purple-300 mt-0.5 flex items-center gap-1">
              <Bell size={11} /> Meldingen
            </span>
          </div>
          <div className="flex flex-col items-center py-4">
            <span className="text-2xl font-black text-white">{recenteNotities.length}</span>
            <span className="text-xs text-purple-300 mt-0.5 flex items-center gap-1">
              <StickyNote size={11} /> Notities
            </span>
          </div>
        </div>
      </div>

      {/* Urgente taken + notities naast elkaar */}
      {(urgenteTaken.length > 0 || recenteNotities.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgenteTaken.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <h3 className="text-sm font-semibold text-gray-700">Urgent</h3>
                </div>
                <Link href="/taken" className="text-xs text-[#840562] hover:underline flex items-center gap-0.5">
                  Alles <ChevronRight size={12} />
                </Link>
              </div>
              <ul className="divide-y divide-gray-50">
                {urgenteTaken.map(taak => (
                  <li key={taak.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{taak.titel}</span>
                    {taak.locatie && (
                      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full shrink-0">{taak.locatie}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recenteNotities.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">Jouw notities</h3>
              </div>
              <ul className="divide-y divide-gray-50">
                {recenteNotities.map(n => (
                  <li key={n.id} className="px-5 py-3.5">
                    <p className="text-sm text-gray-600 line-clamp-1">{n.tekst}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.bijgewerkt).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tools */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-0.5">Tools</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const live = tool.status === "live";
            return (
              <a
                key={tool.href}
                href={live ? tool.href : undefined}
                aria-disabled={!live}
                className={`group bg-white rounded-2xl border border-gray-100 p-4 transition-all ${
                  live
                    ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                style={live ? { "--accent": tool.accent } as React.CSSProperties : {}}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center mb-3 transition-colors`}
                >
                  <Icon size={20} style={{ color: tool.accent }} strokeWidth={1.75} />
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight mb-0.5 group-hover:text-gray-900">
                  {tool.label}
                </p>
                <p className="text-xs text-gray-400 leading-snug">{tool.beschrijving}</p>
                {tool.status !== "live" && (
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                    Binnenkort
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
