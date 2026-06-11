"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Bell, X } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const STORAGE_KEY = "tc_push_dismissed";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function updateBadge() {
  try {
    const res = await fetch("/api/meldingen");
    if (!res.ok) return;
    const data = await res.json();
    const ongelezen = data.filter((m: { gelezen: boolean }) => !m.gelezen).length;
    if ("setAppBadge" in navigator) {
      ongelezen > 0
        ? await (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }).setAppBadge(ongelezen)
        : await (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge?.();
    }
  } catch { /**/ }
}

async function abonneren() {
  const reg = await navigator.serviceWorker.ready;
  const bestaand = await reg.pushManager.getSubscription();
  const sub = bestaand ?? await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
}

export default function PushManager() {
  const { status } = useSession();
  const [toonBanner, setToonBanner] = useState(false);
  const badgeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const ondersteund = typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window
    && "Notification" in window;

  useEffect(() => {
    if (status !== "authenticated" || !ondersteund) return;

    // Badge elke 30s bijwerken
    updateBadge();
    badgeInterval.current = setInterval(updateBadge, 30000);

    // Check huidige permissie
    const permissie = Notification.permission;
    const gedismissed = localStorage.getItem(STORAGE_KEY);

    if (permissie === "granted") {
      // Al toegestaan — gewoon abonneren
      abonneren().catch(() => {});
    } else if (permissie === "default" && !gedismissed) {
      // Nog niet gevraagd en niet weggedrukt — toon banner
      setToonBanner(true);
    }

    return () => { if (badgeInterval.current) clearInterval(badgeInterval.current); };
  }, [status, ondersteund]);

  async function activeren() {
    setToonBanner(false);
    try {
      const permissie = await Notification.requestPermission();
      if (permissie === "granted") await abonneren();
    } catch { /**/ }
  }

  function sluiten() {
    setToonBanner(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!toonBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex items-start gap-3">
      <div className="p-2 bg-purple-50 rounded-lg shrink-0">
        <Bell size={16} className="text-[#840562]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">Meldingen inschakelen</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Ontvang een melding als er iets nieuws is.</p>
        <button
          onClick={activeren}
          className="mt-2.5 bg-[#840562] hover:bg-[#6d044f] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          Inschakelen
        </button>
      </div>
      <button onClick={sluiten} className="text-gray-400 hover:text-gray-600 shrink-0">
        <X size={15} />
      </button>
    </div>
  );
}
