import { prisma } from "@/lib/db";
import SnelkeuzeBeheer from "./SnelkeuzeBeheer";

export const dynamic = "force-dynamic";

export default async function SnelkeuzesAdminPage() {
  const groepen = await prisma.snelkeuzeGroep.findMany({
    orderBy: { volgorde: "asc" },
    include: { nummers: { orderBy: { volgorde: "asc" } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Snelkeuzes beheren</h1>
          <p className="text-sm text-gray-400 mt-1">Groepen en nummers toevoegen, bewerken of verwijderen.</p>
        </div>
      </div>
      <SnelkeuzeBeheer groepen={groepen} />
    </div>
  );
}
