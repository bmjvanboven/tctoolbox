"use client";

import { useState } from "react";
import type { User } from "@prisma/client";
import GebruikerFormulier from "./GebruikerFormulier";

export type GebruikerRij = Omit<User, "password"> & { heeftWachtwoord: boolean };

const rolLabels: Record<string, string> = {
  ADMIN: "Admin",
  SHOPMEDEWERKER: "Shopmedewerker",
  RETENTIEMEDEWERKER: "Retentiemedewerker",
  REPARATIESPECIALIST: "Reparatiespecialist",
};

export default function GebruikersTable({ gebruikers }: { gebruikers: GebruikerRij[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GebruikerRij | null>(null);

  function handleNieuw() {
    setSelected(null);
    setOpen(true);
  }

  function handleBewerk(user: GebruikerRij) {
    setSelected(user);
    setOpen(true);
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{gebruikers.length} gebruikers</p>
          <button
            onClick={handleNieuw}
            className="bg-[#840562] hover:bg-[#6d044f] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nieuwe gebruiker
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Naam</th>
              <th className="text-left px-5 py-3">E-mail</th>
              <th className="text-left px-5 py-3">Rol</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gebruikers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{user.name}</td>
                <td className="px-5 py-3 text-gray-600">{user.email}</td>
                <td className="px-5 py-3">
                  <span className="inline-block bg-purple-100 text-[#840562] text-xs font-medium px-2 py-0.5 rounded-full">
                    {rolLabels[user.role]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {!user.heeftWachtwoord ? (
                    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Uitnodiging verstuurd
                    </span>
                  ) : (
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${user.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {user.active ? "Actief" : "Inactief"}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => handleBewerk(user)}
                    className="text-[#840562] hover:underline text-xs font-medium"
                  >
                    Bewerken
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <GebruikerFormulier
          gebruiker={selected}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
