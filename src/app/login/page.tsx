"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Image from "next/image";
import logoWit from "../../../public/logo-wit.png";
import logo from "../../../public/logo.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Ongeldig e-mailadres of wachtwoord.");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Linker kolom — paarse branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#840562] flex-col items-center justify-center px-16 relative overflow-hidden">
        {/* Decoratieve cirkels */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -right-12 w-48 h-48 rounded-full bg-[#ef8400]/20" />

        <div className="relative z-10 text-center">
          <Image src={logoWit} alt="Telecombinatie" className="mx-auto mb-12 h-14 w-auto" />

          <h1 className="text-3xl font-black text-white mb-4 leading-tight">
            Welkom bij de<br />Telecombinatie Toolbox
          </h1>
          <p className="text-purple-200 text-base leading-relaxed max-w-xs mx-auto">
            Alles wat je nodig hebt als team op één plek. Taken bijhouden, notities delen, prijzen opzoeken en nog veel meer.
          </p>

          <div className="mt-12 flex flex-col gap-3 text-left max-w-xs mx-auto">
            {[
              "Taken aanmaken & toewijzen aan collega's",
              "Notities koppelen aan taken & vestigingen",
              "Reparatieprijzen & inkoopberekeningen",
              "Belscripts, snelkeuzes & klantentool",
              "Refurbished inboeken & verkoopprijzen",
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#ef8400] flex items-center justify-center shrink-0">
                  <ArrowRight size={11} className="text-white" />
                </div>
                <span className="text-sm text-purple-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rechter kolom — loginformulier */}
      <div className="flex-1 flex items-center justify-center bg-[#f8f8f8] px-6">
        <div className="w-full max-w-sm">
          {/* Logo + welkomsttekst op mobiel */}
          <div className="lg:hidden mb-8">
            <div className="flex justify-center mb-6">
              <Image src={logo} alt="Telecombinatie" className="h-10 w-auto" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
              Welkom bij de<br />Telecombinatie Toolbox
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Alles wat je nodig hebt als team op één plek. Taken bijhouden, notities delen, prijzen opzoeken en nog veel meer.
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Taken aanmaken & toewijzen aan collega's",
                "Notities koppelen aan taken & vestigingen",
                "Reparatieprijzen & inkoopberekeningen",
                "Belscripts, snelkeuzes & klantentool",
                "Refurbished inboeken & verkoopprijzen",
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#840562] flex items-center justify-center shrink-0">
                    <ArrowRight size={9} className="text-white" />
                  </div>
                  <span className="text-xs text-gray-600">{item}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-6" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900">Inloggen</h2>
            <p className="text-gray-400 text-sm mt-1">Toegang tot de Telecombinatie Toolbox</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                E-mailadres
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="naam@telecombinatie.nl"
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#840562] focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Wachtwoord */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#840562] focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Foutmelding */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#840562] hover:bg-[#6d044f] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors mt-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Bezig met inloggen…
                </span>
              ) : (
                <>
                  Inloggen
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            © {new Date().getFullYear()} Telecombinatie · Intern gebruik
          </p>
        </div>
      </div>
    </div>
  );
}
