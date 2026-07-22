import { prisma } from "@/lib/db";
import VerkoopClient from "./VerkoopClient";

export const dynamic = "force-dynamic";

export default async function VerkoopPage() {
  const modellen = await prisma.verkoopModel.findMany({
    orderBy: { volgorde: "asc" },
    include: { prijzen: { orderBy: [{ gb: "asc" }, { grade: "asc" }] } },
  });

  const data = modellen.map(m => ({
    id: m.id,
    naam: m.naam,
    prijzen: m.prijzen.map(p => ({ id: p.id, gb: p.gb, grade: p.grade, prijs: p.prijs })),
  }));

  return <VerkoopClient modellen={data} />;
}
