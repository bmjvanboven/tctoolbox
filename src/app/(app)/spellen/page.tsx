import Link from "next/link";
import { Target, Gamepad2 } from "lucide-react";

const spellen = [
  {
    href: "/spellen/pinpoint",
    label: "Merk Pinpoint",
    beschrijving: "Raad het merk, product of begrip in zo min mogelijk woorden",
    icon: Target,
    accent: "#840562",
    bg: "bg-purple-50",
    status: "live",
  },
];

export default function SpellenPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Gamepad2 size={18} className="text-gray-400" />
        <div>
          <h1 className="text-lg font-bold text-gray-800">Spellen</h1>
          <p className="text-sm text-gray-400">
            Elke dag een nieuwe puzzel, 1x per dag te spelen. Speel mee en klim in het dagelijkse leaderboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {spellen.map((spel) => {
          const Icon = spel.icon;
          const live = spel.status === "live";
          return (
            <Link
              key={spel.href}
              href={live ? spel.href : "#"}
              aria-disabled={!live}
              className={`group bg-white rounded-2xl border border-gray-100 p-4 transition-all ${
                live
                  ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  : "opacity-50 cursor-not-allowed pointer-events-none"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${spel.bg} flex items-center justify-center mb-3 transition-colors`}>
                <Icon size={20} style={{ color: spel.accent }} strokeWidth={1.75} />
              </div>
              <p className="text-sm font-semibold text-gray-800 leading-tight mb-0.5 group-hover:text-gray-900">
                {spel.label}
              </p>
              <p className="text-xs text-gray-400 leading-snug">{spel.beschrijving}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
