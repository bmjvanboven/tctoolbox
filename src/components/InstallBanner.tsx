"use client";

import { useEffect, useState } from "react";
import { X, Share, Plus } from "lucide-react";

type Platform = "ios" | "android" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return null;
}

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function InstallBanner() {
  const [toon, setToon] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [stap, setStap] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (isInstalled()) return;
    if (localStorage.getItem("tc_install_dismissed")) return;

    const p = detectPlatform();
    setPlatform(p);

    if (p === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as Event & { prompt: () => Promise<void> });
        setToon(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    if (p === "ios") {
      // Kleine vertraging zodat het niet meteen op login knalt
      const t = setTimeout(() => setToon(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  function sluiten() {
    setToon(false);
    localStorage.setItem("tc_install_dismissed", "1");
  }

  async function installAndroid() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setToon(false);
  }

  if (!toon) return null;

  // iOS instructies — stap voor stap
  if (platform === "ios") {
    const stappen = [
      {
        icon: <Share size={20} className="text-blue-500" />,
        tekst: <>Tik op het <strong>Deel-icoon</strong> onderaan je browser (het vakje met een pijltje omhoog)</>,
      },
      {
        icon: <Plus size={20} className="text-blue-500" />,
        tekst: <>Scroll naar beneden en tik op <strong>&apos;Zet op beginscherm&apos;</strong></>,
      },
      {
        icon: <span className="text-xl">✓</span>,
        tekst: <>Tik op <strong>Voeg toe</strong> — klaar! De app staat op je beginscherm.</>,
      },
    ];

    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[#840562] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-72x72.png" alt="" className="w-8 h-8 rounded-lg" />
            <div>
              <p className="text-white text-sm font-bold">Installeer de app</p>
              <p className="text-purple-200 text-xs">Voeg toe aan je beginscherm</p>
            </div>
          </div>
          <button onClick={sluiten} className="text-white/60 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex gap-1 mb-4">
            {stappen.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= stap ? "bg-[#840562]" : "bg-gray-200"}`} />
            ))}
          </div>

          <div className="flex items-start gap-3 min-h-[48px]">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              {stappen[stap].icon}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pt-1">{stappen[stap].tekst}</p>
          </div>

          <div className="flex gap-2 mt-4">
            {stap > 0 && (
              <button onClick={() => setStap(s => s - 1)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-xl">
                Vorige
              </button>
            )}
            {stap < stappen.length - 1 ? (
              <button onClick={() => setStap(s => s + 1)}
                className="flex-1 bg-[#840562] text-white text-sm font-semibold py-2 rounded-xl">
                Volgende stap
              </button>
            ) : (
              <button onClick={sluiten}
                className="flex-1 bg-[#840562] text-white text-sm font-semibold py-2 rounded-xl">
                Klaar!
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Android — native prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-72x72.png" alt="" className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">Installeer de app</p>
          <p className="text-xs text-gray-400 mt-0.5">Voeg TC Toolbox toe aan je beginscherm</p>
        </div>
        <button onClick={sluiten} className="text-gray-400 hover:text-gray-600 shrink-0 p-1">
          <X size={15} />
        </button>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={sluiten} className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2 rounded-xl">
          Niet nu
        </button>
        <button onClick={installAndroid} className="flex-1 bg-[#840562] text-white text-sm font-semibold py-2 rounded-xl">
          Installeren
        </button>
      </div>
    </div>
  );
}
