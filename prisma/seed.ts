import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const snelkeuzeData = [
  { code: 100, naam: "TC connect", volgorde: 1, nummers: [
    { code: 102, naam: "Tim", volgorde: 1 },
    { code: 103, naam: "Inge Lenssen", volgorde: 2 },
    { code: 105, naam: "Jannus", volgorde: 3 },
    { code: 106, naam: "Rene", volgorde: 4 },
    { code: 107, naam: "Luc", volgorde: 5 },
    { code: 109, naam: "Thijs", volgorde: 6 },
    { code: 110, naam: "Inge Sneeuw", volgorde: 7 },
  ]},
  { code: 200, naam: "Deurne", volgorde: 2, nummers: [
    { code: 201, naam: "Balie 1", volgorde: 1 },
    { code: 202, naam: "Balie 2", volgorde: 2 },
    { code: 203, naam: "Balie 3 (Dect)", volgorde: 3 },
    { code: 204, naam: "Repair Deurne", volgorde: 4 },
    { code: 205, naam: "Kantoor 1", volgorde: 5 },
    { code: 206, naam: "Kantoor 2", volgorde: 6 },
  ]},
  { code: 300, naam: "Asten", volgorde: 3, nummers: [
    { code: 301, naam: "Balie 1 (& Dect)", volgorde: 1 },
    { code: 302, naam: "Balie 2", volgorde: 2 },
  ]},
  { code: 400, naam: "Gemert", volgorde: 4, nummers: [
    { code: 401, naam: "Balie 1", volgorde: 1 },
    { code: 402, naam: "Balie 2", volgorde: 2 },
    { code: 403, naam: "Balie 3 (Dect)", volgorde: 3 },
    { code: 404, naam: "Repair Gemert", volgorde: 4 },
  ]},
  { code: 500, naam: "Veghel", volgorde: 5, nummers: [
    { code: 501, naam: "Balie 1", volgorde: 1 },
    { code: 502, naam: "Balie 2 (& Dect)", volgorde: 2 },
    { code: 503, naam: "Michiel", volgorde: 3 },
  ]},
  { code: 600, naam: "Geldrop", volgorde: 6, nummers: [
    { code: 601, naam: "Balie 1", volgorde: 1 },
    { code: 602, naam: "Balie 2", volgorde: 2 },
    { code: 603, naam: "Michiel", volgorde: 3 },
  ]},
];

async function main() {
  const password = await bcrypt.hash("Admin@2024!", 12);

  await prisma.user.upsert({
    where: { email: "admin@telecombinatie.nl" },
    update: {},
    create: {
      name: "Beheerder",
      email: "admin@telecombinatie.nl",
      password,
      role: "ADMIN",
    },
  });

  for (const [i, groep] of snelkeuzeData.entries()) {
    const { nummers, ...groepData } = groep;
    const bestaand = await prisma.snelkeuzeGroep.findUnique({ where: { code: groepData.code } });
    if (!bestaand) {
      await prisma.snelkeuzeGroep.create({
        data: { ...groepData, nummers: { create: nummers } },
      });
    }
  }

  console.log("Seed klaar. Admin: admin@telecombinatie.nl / Admin@2024!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
