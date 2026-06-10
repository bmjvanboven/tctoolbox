import { prisma } from "@/lib/db";
import VerkoopPrijzenBeheer from "./VerkoopPrijzenBeheer";

export default async function VerkoopPrijzenAdminPage() {
  const modellen = await prisma.verkoopModel.findMany({
    orderBy: { volgorde: "asc" },
    include: { prijzen: { orderBy: [{ gb: "asc" }, { grade: "asc" }] } },
  });
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verkoopprijzen refurbished</h1>
        <p className="text-sm text-gray-400 mt-1">Klik op een prijs om deze te bewerken.</p>
      </div>
      <VerkoopPrijzenBeheer modellen={modellen} />
    </div>
  );
}
