import { prisma } from "@/lib/db";
import ReparatieprijzenClient from "./ReparatieprijzenClient";

export default async function ReparatieprijzenPage() {
  const merken = await prisma.reparatieMerk.findMany({
    orderBy: { volgorde: "asc" },
    include: {
      modellen: {
        orderBy: { volgorde: "asc" },
        include: { items: { orderBy: [{ cat: "asc" }, { id: "asc" }] } },
      },
    },
  });

  const data = Object.fromEntries(
    merken.map(m => [m.key, {
      label: m.label,
      models: m.modellen.map(model => ({
        id: model.modelKey,
        label: model.label,
        group: model.groep ?? undefined,
        repairs: model.items.map(i => ({ cat: i.cat, name: i.naam, price: i.prijs })),
      })),
    }])
  );

  return <ReparatieprijzenClient data={data} />;
}
