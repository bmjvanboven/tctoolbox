import { prisma } from "@/lib/db";
import RefurbishedClient from "./RefurbishedClient";

export default async function RefurbishedInboekPage() {
  const modellen = await prisma.verkoopModel.findMany({
    orderBy: { volgorde: "asc" },
    include: { prijzen: { orderBy: [{ gb: "asc" }, { grade: "asc" }] } },
  });

  const data = modellen.map(m => ({
    id: m.id,
    naam: m.naam,
    gb: [...new Set(m.prijzen.map(p => p.gb))].sort((a, b) => a - b),
    prijzen: m.prijzen.map(p => ({ id: p.id, gb: p.gb, grade: p.grade, prijs: p.prijs })),
  }));

  return <RefurbishedClient modellen={data} />;
}
