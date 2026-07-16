"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo.png";

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verzonden, setVerzonden] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/wachtwoord-vergeten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Er is een fout opgetreden.");
      setLoading(false);
      return;
    }

    setVerzonden(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src={logo} alt="Telecombinatie" className="h-10 w-auto" />
        </div>

        {verzonden ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <CheckCircle2 size={32} className="mx-auto text-green-600 mb-3" />
            <h1 className="text-lg font-bold text-gray-900 mb-2">Check je inbox</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Als <span className="font-medium text-gray-700">{email}</span> bekend is bij ons, ontvang je binnen enkele minuten een e-mail met een link om je wachtwoord te resetten. De link is 30 minuten geldig.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900">Wachtwoord vergeten</h1>
              <p className="text-gray-400 text-sm mt-1">
                Vul je e-mailadres in, dan sturen we je een resetlink.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  E-mailadres
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="naam@telecombinatie.nl"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#840562] focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

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
                    Versturen…
                  </span>
                ) : (
                  <>
                    Resetlink versturen
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

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
