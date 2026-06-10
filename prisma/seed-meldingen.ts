import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) { console.log("Geen admin gevonden."); return; }

  const meldingen = [
    {
      titel: "Welkom in de nieuwe Toolbox!",
      tekst: "De Telecombinatie Toolbox is live. Alle tools zijn beschikbaar via het dashboard. Neem gerust contact op met een admin bij vragen.",
      type: "info",
      doel: "IEDEREEN" as const,
    },
    {
      titel: "Reparatieprijzen bijgewerkt",
      tekst: "De reparatieprijzen voor iPhone 15 en 16 serie zijn per direct aangepast. Check de tool voor de nieuwe tarieven.",
      type: "update",
      doel: "IEDEREEN" as const,
    },
    {
      titel: "Gepland onderhoud — zaterdag 22:00–23:00",
      tekst: "Aanstaande zaterdag tussen 22:00 en 23:00 is de toolbox tijdelijk niet beschikbaar wegens een systeemupdate.",
      type: "onderhoud",
      doel: "IEDEREEN" as const,
    },
    {
      titel: "Tip: gebruik de locatiekiezer",
      tekst: "Via de locatiekiezer rechtsboven kun je je winkellocatie instellen. De klantentool pikt dit automatisch op zodat je berichten altijd de juiste winkel vermelden.",
      type: "tip",
      doel: "IEDEREEN" as const,
    },
    {
      titel: "Nieuwe tool: Reparatieplanner in ontwikkeling",
      tekst: "We werken aan de Reparatieplanner waarmee je reparaties kunt inplannen en de voortgang kunt bewaken. Verwachte lancering binnenkort.",
      type: "nieuws",
      doel: "IEDEREEN" as const,
    },
    {
      titel: "Actie: verlenging campagne KPN actief",
      tekst: "Let op: de KPN verlengingscampagne loopt t/m einde van de maand. Gebruik het belscript voor de juiste gespreksopening.",
      type: "actie",
      doel: "ROL" as const,
      doelRol: "RETENTIEMEDEWERKER" as const,
    },
  ];

  for (const m of meldingen) {
    await prisma.melding.create({
      data: {
        ...m,
        vanId: admin.id,
        doelRol: "doelRol" in m ? m.doelRol : null,
        doelId: null,
      },
    });
  }

  console.log(`${meldingen.length} meldingen aangemaakt.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
