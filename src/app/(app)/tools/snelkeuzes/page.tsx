import { prisma } from "@/lib/db";
import SnelkeuzesClient from "./SnelkeuzesClient";

export default async function SnelkeuzesPage() {
  const groepen = await prisma.snelkeuzeGroep.findMany({
    orderBy: { volgorde: "asc" },
    include: { nummers: { orderBy: { volgorde: "asc" } } },
  });

  return (
    <div>
      <p className="text-gray-400 text-sm mb-6">Klik op een nummer om het te kopiëren.</p>
      <SnelkeuzesClient groepen={groepen} />
    </div>
  );
}
