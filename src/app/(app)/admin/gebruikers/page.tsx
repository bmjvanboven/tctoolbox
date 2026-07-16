import { prisma } from "@/lib/db";
import GebruikersTable from "./GebruikersTable";

export default async function GebruikersPage() {
  const ruweGebruikers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  const gebruikers = ruweGebruikers.map(({ password, ...rest }) => ({
    ...rest,
    heeftWachtwoord: password !== null,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gebruikers</h1>
      </div>
      <GebruikersTable gebruikers={gebruikers} />
    </div>
  );
}
