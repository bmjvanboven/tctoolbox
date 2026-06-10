"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";

interface Props {
  gebruiker: User | null;
  onClose: () => void;
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#840562]";

export default function GebruikerFormulier({ gebruiker, onClose }: Props) {
  const router = useRouter();
  const [voornaam, setVoornaam] = useState(gebruiker?.voornaam ?? "");
  const [achternaam, setAchternaam] = useState(gebruiker?.achternaam ?? "");
  const [email, setEmail] = useState(gebruiker?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(gebruiker?.role ?? "SHOPMEDEWERKER");
  const [active, setActive] = useState(gebruiker?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const name = `${voornaam.trim()} ${achternaam.trim()}`.trim();
    const body = gebruiker
      ? { id: gebruiker.id, voornaam, achternaam, name, email, role, active, ...(password ? { password } : {}) }
      : { voornaam, achternaam, name, email, password, role, active };

    const res = await fetch("/api/admin/gebruikers", {
      method: gebruiker ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Er is een fout opgetreden.");
      setLoading(false);
      return;
    }

    router.refresh();
    onClose();
  }

  async function handleVerwijder() {
    if (!gebruiker || !confirm(`Verwijder ${gebruiker.name}?`)) return;
    await fetch(`/api/admin/gebruikers?id=${gebruiker.id}`, { method: "DELETE" });
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          {gebruiker ? "Gebruiker bewerken" : "Nieuwe gebruiker"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wachtwoord {gebruiker && <span className="text-gray-400 font-normal">(leeg = niet wijzigen)</span>}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!gebruiker} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className={inputClass}>
              <option value="ADMIN">Admin</option>
              <option value="SHOPMEDEWERKER">Shopmedewerker</option>
              <option value="RETENTIEMEDEWERKER">Retentiemedewerker</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#840562]" />
            <label htmlFor="active" className="text-sm text-gray-700">Actief</label>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#840562] hover:bg-[#6d044f] text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
              {loading ? "Opslaan..." : "Opslaan"}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition-colors">
              Annuleren
            </button>
          </div>

          {gebruiker && (
            <button type="button" onClick={handleVerwijder}
              className="w-full text-red-600 hover:text-red-700 text-sm font-medium py-2 transition-colors">
              Gebruiker verwijderen
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
