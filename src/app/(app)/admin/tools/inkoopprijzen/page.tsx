import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import InkoopPrijzenBeheer from "./InkoopPrijzenBeheer";

export const dynamic = "force-dynamic";

export default async function InkoopPrijzenAdminPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "REPARATIESPECIALIST")) {
    redirect("/");
  }

  const modellen = await prisma.verkoopModel.findMany({
    orderBy: { volgorde: "asc" },
    include: { prijzen: { orderBy: [{ gb: "asc" }, { grade: "asc" }] } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inkoopprijzen beheren</h1>
        <p className="text-sm text-gray-400 mt-1">Maximale innameprijzen per toestel, opslag en grade. Klik op een prijs om te bewerken.</p>
      </div>
      <InkoopPrijzenBeheer modellen={modellen} />
    </div>
  );
}
