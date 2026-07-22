import { prisma } from "@/lib/db";
import InkoopClient from "./InkoopClient";

export const dynamic = "force-dynamic";

export default async function InkoopPage() {
  const modellen = await prisma.verkoopModel.findMany({
    orderBy: { volgorde: "asc" },
    include: { prijzen: { orderBy: [{ gb: "asc" }, { grade: "asc" }] } },
  });

  const data = modellen.map(m => ({
    id: m.id,
    naam: m.naam,
    onderdelenInname: m.onderdelenInname,
    gb: [...new Set(m.prijzen.map(p => p.gb))].sort((a, b) => a - b),
    prijzen: m.prijzen.map(p => ({ id: p.id, gb: p.gb, grade: p.grade, prijs: p.prijs, innamePrijs: p.innamePrijs })),
  }));

  return <InkoopClient modellen={data} />;
}
