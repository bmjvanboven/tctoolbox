import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ReparatiePrijzenBeheer from "./ReparatiePrijzenBeheer";

export default async function ReparatiePrijzenAdminPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "REPARATIESPECIALIST")) {
    redirect("/");
  }

  const merken = await prisma.reparatieMerk.findMany({
    orderBy: { volgorde: "asc" },
    include: {
      modellen: {
        orderBy: { volgorde: "asc" },
        include: { items: { orderBy: { cat: "asc" } } },
      },
    },
  });
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reparatieprijzen beheren</h1>
        <p className="text-sm text-gray-400 mt-1">Klik op een prijs om deze te bewerken.</p>
      </div>
      <ReparatiePrijzenBeheer merken={merken} />
    </div>
  );
}
