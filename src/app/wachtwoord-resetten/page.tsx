"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { WACHTWOORD_EISEN, valideerWachtwoord } from "@/lib/wachtwoord";

function WachtwoordResettenForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [wachtwoord, setWachtwoord] = useState("");
  const [bevestig, setBevestig] = useState("");
  const [loading, setLoading] = useState(false);
  const [gelukt, setGelukt] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (wachtwoord !== bevestig) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }
    const fout = valideerWachtwoord(wachtwoord);
    if (fout) {
      setError(fout);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/wachtwoord-resetten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, wachtwoord }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Er is een fout opgetreden.");
      setLoading(false);
      return;
    }

    setGelukt(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500">
          Deze link is ongeldig. Vraag een nieuwe resetlink aan via{" "}
          <Link href="/wachtwoord-vergeten" className="text-[#840562] font-medium">
            wachtwoord vergeten
          </Link>
          .
        </p>
      </div>
    );
  }

  if (gelukt) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
        <CheckCircle2 size={32} className="mx-auto text-green-600 mb-3" />
        <h1 className="text-lg font-bold text-gray-900 mb-2">Wachtwoord bijgewerkt</h1>
        <p className="text-sm text-gray-500">Je wordt doorgestuurd naar de inlogpagina…</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Nieuw wachtwoord instellen</h1>
        <p className="text-gray-400 text-sm mt-1">Kies een sterk, nieuw wachtwoord.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Nieuw wachtwoord
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#840562] focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Bevestig wachtwoord
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={bevestig}
              onChange={(e) => setBevestig(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#840562] focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        <ul className="text-xs text-gray-400 space-y-0.5">
          {WACHTWOORD_EISEN.map((eis) => (
            <li key={eis}>• {eis}</li>
          ))}
        </ul>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#840562] hover:bg-[#6d044f] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors mt-2 group"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Bezig…
            </span>
          ) : (
            <>
              Wachtwoord instellen
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function WachtwoordResettenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src={logo} alt="Telecombinatie" className="h-10 w-auto" />
        </div>

        <Suspense fallback={null}>
          <WachtwoordResettenForm />
        </Suspense>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Terug naar inloggen
        </Link>
      </div>
    </div>
  );
}
