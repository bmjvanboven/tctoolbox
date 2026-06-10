import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ClipboardList, Phone, Users, Smartphone, Wrench, Zap, CalendarClock } from "lucide-react";

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

export default async function HomePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  const voornaam = user?.voornaam || session?.user.name || "";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welkom, {voornaam}
        </h2>
        <p className="text-gray-500 mt-1">Kies een tool om mee te beginnen.</p>
      </div>

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
  );
}
