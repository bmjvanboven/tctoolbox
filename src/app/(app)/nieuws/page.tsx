import { haalBrancheNieuwsOp, BRON_KLEUR } from "@/lib/branchenieuws";
import { Rss } from "lucide-react";

export default async function NieuwsPage() {
  const items = await haalBrancheNieuwsOp(8, 30);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Rss size={18} className="text-gray-400" />
        <div>
          <h1 className="text-lg font-bold text-gray-800">Branchenieuws</h1>
          <p className="text-sm text-gray-400">
            Recent nieuws over iPhone, Samsung Galaxy en de Nederlandse telecomproviders.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          Geen nieuws gevonden. Probeer het straks nog eens.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {items.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-20 shrink-0 mt-0.5">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${BRON_KLEUR[item.bron] ?? "bg-gray-100 text-gray-500"}`}>
                      {item.bron}
                    </span>
                  </span>
                  <span className="text-sm text-gray-700 flex-1">{item.titel}</span>
                  {item.datum && (
                    <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                      {new Date(item.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
