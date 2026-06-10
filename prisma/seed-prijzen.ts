import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import reparatieData from "../public/data-reparatieprijzen.json" assert { type: "json" };
import verkoopData from "../public/data-verkoopprijzen.json" assert { type: "json" };

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Reparatieprijzen
  for (const [key, brand] of Object.entries(reparatieData as Record<string, { label: string; models: { id: string; label: string; group?: string; repairs: { cat: string; name: string; price: number }[] }[] }>)) {
    let merk = await prisma.reparatieMerk.findUnique({ where: { key } });
    if (!merk) {
      merk = await prisma.reparatieMerk.create({ data: { key, label: brand.label, volgorde: key === "apple" ? 0 : 1 } });
    }
    for (const [mi, model] of brand.models.entries()) {
      const bestaandModel = await prisma.reparatieModel.findUnique({ where: { merkId_modelKey: { merkId: merk.id, modelKey: model.id } } });
      if (!bestaandModel) {
        await prisma.reparatieModel.create({
          data: {
            merkId: merk.id,
            modelKey: model.id,
            label: model.label,
            groep: model.group ?? null,
            volgorde: mi,
            items: { create: model.repairs.map(r => ({ cat: r.cat, naam: r.name, prijs: r.price })) },
          },
        });
      }
    }
  }
  console.log("Reparatieprijzen geseed.");

  // Verkoopprijzen
  for (const [vi, model] of (verkoopData as unknown as { n: string; s: number[]; A: Record<string,number>; B: Record<string,number>; C: Record<string,number> }[]).entries()) {
    let vm = await prisma.verkoopModel.findUnique({ where: { naam: model.n } });
    if (!vm) {
      vm = await prisma.verkoopModel.create({ data: { naam: model.n, volgorde: vi } });
    }
    for (const gb of model.s) {
      for (const grade of ["A", "B", "C"] as const) {
        const prijs = model[grade]?.[String(gb)];
        if (prijs === undefined) continue;
        await prisma.verkoopPrijs.upsert({
          where: { modelId_gb_grade: { modelId: vm.id, gb, grade } },
          update: { prijs },
          create: { modelId: vm.id, gb, grade, prijs },
        });
      }
    }
  }
  console.log("Verkoopprijzen geseed.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
