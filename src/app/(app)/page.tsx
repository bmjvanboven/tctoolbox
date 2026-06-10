import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ClipboardList, Phone, Users, Smartphone, Wrench,
  Zap, CalendarClock, CheckSquare, Bell, StickyNote, ArrowRight,
} from "lucide-react";

const tools = [
  {
    href: "/tools/adviesformulier",
    label: "Adviesformulier",
    beschrijving: "Genereer een adviesformulier voor de klant",
    icon: ClipboardList,
    kleur: "bg-purple-50 text-[#840562]",
    rand: "hover:border-[#840562]",
    status: "live",
  },
  {
    href: "/tools/belscript",
    label: "Belscript",
    beschrijving: "Scripts voor telefooncontact met klanten",
    icon: Phone,
    kleur: "bg-orange-50 text-[#ef8400]",
    rand: "hover:border-[#ef8400]",
    status: "live",
  },
  {
    href: "/tools/klantentool",
    label: "Klantentool",
    beschrijving: "Klantgegevens opzoeken en beheren",
    icon: Users,
    kleur: "bg-sky-50 text-[#00a7de]",
    rand: "hover:border-[#00a7de]",
    status: "live",
  },
  {
    href: "/tools/refurbished-inboek",
    label: "Refurbished inboek",
    beschrijving: "Refurbished toestellen inboeken",
    icon: Smartphone,
    kleur: "bg-purple-50 text-[#840562]",
    rand: "hover:border-[#840562]",
    status: "live",
  },
  {
    href: "/tools/reparatieprijzen",
    label: "Reparatieprijzen",
    beschrijving: "Prijzen voor reparaties opzoeken",
    icon: Wrench,
    kleur: "bg-orange-50 text-[#ef8400]",
    rand: "hover:border-[#ef8400]",
    status: "live",
  },
  {
    href: "/tools/snelkeuzes",
    label: "Snelkeuzes",
    beschrijving: "Veelgebruikte acties en links",
    icon: Zap,
    kleur: "bg-sky-50 text-[#00a7de]",
    rand: "hover:border-[#00a7de]",
    status: "live",
  },
  {
    href: "/tools/reparatieplanner",
    label: "Reparatieplanner",
    beschrijving: "Reparaties inplannen en bewaken",
    icon: CalendarClock,
    kleur: "bg-purple-50 text-[#840562]",
    rand: "hover:border-[#840562]",
    status: "ontwikkeling",
  },
];

function daggroet(voornaam: string) {
  const uur = new Date().getHours();
  if (uur < 12) return `Goedemorgen, ${voornaam}!`;
  if (uur < 18) return `Goedemiddag, ${voornaam}!`;
  return `Goedenavond, ${voornaam}!`;
}

export default async function HomePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, openTaken, ongelezen, recenteNotities, urgenteTaken] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),

    prisma.taak.count({
      where: { toegewezenAanId: userId, afgerond: false },
    }),

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
      select: { id: true, titel: true, prioriteit: true, verloopdatum: true, locatie: true },
    }),
  ]);

  const voornaam = user?.voornaam || session?.user.name || "";

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <div className="bg-gradient-to-r from-[#840562] to-[#6d044f] rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">{daggroet(voornaam)}</h2>
        <p className="text-purple-200 text-sm">
          {openTaken === 0
            ? "Je hebt geen openstaande taken. Lekker bezig!"
            : `Je hebt ${openTaken} openstaande ${openTaken === 1 ? "taak" : "taken"}.`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/taken" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#840562] hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckSquare size={16} className="text-[#840562]" />
            </div>
            {openTaken > 0 && (
              <span className="text-xs font-bold bg-[#840562] text-white px-1.5 py-0.5 rounded-full">
                {openTaken}
              </span>
            )}
          </div>
          <p className="text-2xl font-black text-gray-900">{openTaken}</p>
          <p className="text-xs text-gray-400 mt-0.5">Open taken</p>
        </Link>

        <Link href="/" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#ef8400] hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Bell size={16} className="text-[#ef8400]" />
            </div>
            {ongelezen > 0 && (
              <span className="text-xs font-bold bg-[#ef8400] text-white px-1.5 py-0.5 rounded-full">
                {ongelezen}
              </span>
            )}
          </div>
          <p className="text-2xl font-black text-gray-900">{ongelezen}</p>
          <p className="text-xs text-gray-400 mt-0.5">Meldingen</p>
        </Link>

        <Link href="/" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#00a7de] hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-sky-50 rounded-lg">
              <StickyNote size={16} className="text-[#00a7de]" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{recenteNotities.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Notities</p>
        </Link>
      </div>

      {/* Urgente taken */}
      {urgenteTaken.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Urgente taken</h3>
            <Link href="/taken" className="text-xs text-[#840562] hover:underline flex items-center gap-1">
              Alles zien <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {urgenteTaken.map(taak => (
              <li key={taak.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{taak.titel}</span>
                {taak.locatie && (
                  <span className="text-xs text-gray-400 shrink-0">{taak.locatie}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recente notities */}
      {recenteNotities.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Jouw notities</h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {recenteNotities.map(n => (
              <li key={n.id} className="px-5 py-3">
                <p className="text-sm text-gray-700 line-clamp-2">{n.tekst}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.bijgewerkt).toLocaleDateString("nl-NL", {
                    day: "numeric", month: "long",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tools grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const live = tool.status === "live";
            return (
              <a
                key={tool.href}
                href={live ? tool.href : undefined}
                aria-disabled={!live}
                className={`bg-white rounded-xl border border-gray-200 p-5 transition-all group ${
                  live
                    ? `hover:shadow-md cursor-pointer ${tool.rand}`
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg ${tool.kleur} transition-colors`}>
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-gray-800 group-hover:text-gray-900">
                        {tool.label}
                      </h2>
                      {tool.status === "live" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Live
                        </span>
                      ) : (
                        <span className="text-xs font-medium bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                          In ontwikkeling
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5 leading-snug">
                      {tool.beschrijving}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
