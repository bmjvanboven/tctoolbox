"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

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
        ? (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }).setAppBadge(ongelezen)
        : (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge?.();
    }
  } catch { /**/ }
}

export default function PushManager() {
  const { status } = useSession();
  const geregistreerd = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || geregistreerd.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    geregistreerd.current = true;

    async function setup() {
      try {
        const reg = await navigator.serviceWorker.ready;

        // Badge bijhouden
        updateBadge();
        const interval = setInterval(updateBadge, 30000);

        // Toestemming vragen als nog niet gedaan
        const permission = await Notification.requestPermission();
        if (permission !== "granted") { clearInterval(interval); return; }

        // Abonneren op push
        const bestaand = await reg.pushManager.getSubscription();
        const sub = bestaand ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Opslaan op server
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });

        return () => clearInterval(interval);
      } catch { /**/ }
    }

    setup();
  }, [status]);

  return null;
}
