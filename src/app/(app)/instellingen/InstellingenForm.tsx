"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562] bg-white";

interface Props {
  user: { voornaam: string; achternaam: string; email: string };
}

export default function InstellingenForm({ user }: Props) {
  const router = useRouter();
  const [voornaam, setVoornaam] = useState(user.voornaam);
  const [achternaam, setAchternaam] = useState(user.achternaam);
  const [huidigWachtwoord, setHuidigWachtwoord] = useState("");
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState("");
  const [bevestigWachtwoord, setBevestigWachtwoord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSucces("");

    if (nieuwWachtwoord && nieuwWachtwoord !== bevestigWachtwoord) {
      setError("Nieuwe wachtwoorden komen niet overeen.");
      return;
    }
    if (nieuwWachtwoord && nieuwWachtwoord.length < 8) {
      setError("Nieuw wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/profiel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voornaam, achternaam, huidigWachtwoord, nieuwWachtwoord }),
    });

    let data: { error?: string; name?: string } = {};
    try { data = await res.json(); } catch { /* lege response */ }

    if (!res.ok) {
      setError(data.error ?? "Er is een fout opgetreden.");
      setLoading(false);
      return;
    }

    setSucces("Instellingen opgeslagen.");
    setHuidigWachtwoord("");
    setNieuwWachtwoord("");
    setBevestigWachtwoord("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profielgegevens */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Profielgegevens</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voornaam</label>
              <input value={voornaam} onChange={(e) => setVoornaam(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Achternaam</label>
              <input value={achternaam} onChange={(e) => setAchternaam(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
            <input value={user.email} disabled className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            <p className="text-xs text-gray-400 mt-1">E-mailadres kan alleen door een admin worden gewijzigd.</p>
          </div>
        </div>
      </div>

      {/* Wachtwoord */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Wachtwoord wijzigen</h2>
        <p className="text-sm text-gray-400 mb-4">Laat leeg als je het wachtwoord niet wilt wijzigen.</p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Huidig wachtwoord</label>
            <input type="password" value={huidigWachtwoord} onChange={(e) => setHuidigWachtwoord(e.target.value)} className={inputClass} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw wachtwoord</label>
            <input type="password" value={nieuwWachtwoord} onChange={(e) => setNieuwWachtwoord(e.target.value)} className={inputClass} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bevestig nieuw wachtwoord</label>
            <input type="password" value={bevestigWachtwoord} onChange={(e) => setBevestigWachtwoord(e.target.value)} className={inputClass} placeholder="••••••••" />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      {succes && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3 flex items-center gap-2">
          <Check size={15} /> {succes}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#840562] hover:bg-[#6d044f] disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
      >
        {loading ? "Opslaan..." : "Opslaan"}
      </button>
    </form>
  );
}
