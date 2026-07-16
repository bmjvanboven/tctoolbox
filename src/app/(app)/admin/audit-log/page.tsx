import { prisma } from "@/lib/db";

const actieLabels: Record<string, { label: string; kleur: string }> = {
  INLOGGEN_GELUKT: { label: "Ingelogd", kleur: "bg-green-100 text-green-700" },
  INLOGGEN_MISLUKT: { label: "Mislukte inlogpoging", kleur: "bg-amber-100 text-amber-700" },
  INLOGGEN_GEBLOKKEERD: { label: "Inlogpoging op geblokkeerd account", kleur: "bg-red-100 text-red-700" },
  ACCOUNT_GEBLOKKEERD: { label: "Account geblokkeerd", kleur: "bg-red-100 text-red-700" },
  WACHTWOORD_VERGETEN_AANGEVRAAGD: { label: "Wachtwoord vergeten aangevraagd", kleur: "bg-purple-100 text-[#840562]" },
  WACHTWOORD_GERESET: { label: "Wachtwoord gereset via mail", kleur: "bg-purple-100 text-[#840562]" },
  WACHTWOORD_GEWIJZIGD: { label: "Wachtwoord gewijzigd", kleur: "bg-purple-100 text-[#840562]" },
  GEBRUIKER_AANGEMAAKT: { label: "Gebruiker aangemaakt", kleur: "bg-blue-100 text-blue-700" },
  GEBRUIKER_GEWIJZIGD: { label: "Gebruiker gewijzigd", kleur: "bg-blue-100 text-blue-700" },
  GEBRUIKER_VERWIJDERD: { label: "Gebruiker verwijderd", kleur: "bg-gray-200 text-gray-700" },
  GEBRUIKER_UITGENODIGD: { label: "Uitnodiging verstuurd", kleur: "bg-purple-100 text-[#840562]" },
  UITNODIGING_OPNIEUW_VERSTUURD: { label: "Uitnodiging opnieuw verstuurd", kleur: "bg-purple-100 text-[#840562]" },
};

function formatteerTijd(datum: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(datum);
}

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { aangemaakt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit log</h1>
        <p className="text-sm text-gray-500 mt-1">
          Laatste 200 gevoelige acties: inloggen, wachtwoordwijzigingen en gebruikersbeheer.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Tijdstip</th>
              <th className="text-left px-5 py-3">Actie</th>
              <th className="text-left px-5 py-3">Gebruiker</th>
              <th className="text-left px-5 py-3">IP-adres</th>
              <th className="text-left px-5 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => {
              const info = actieLabels[log.actie] ?? { label: log.actie, kleur: "bg-gray-100 text-gray-600" };
              return (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatteerTijd(log.aangemaakt)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${info.kleur}`}>
                      {info.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {log.user ? `${log.user.name} (${log.user.email})` : log.email ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{log.ip ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{log.detail ?? "—"}</td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  Nog geen gebeurtenissen geregistreerd.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
