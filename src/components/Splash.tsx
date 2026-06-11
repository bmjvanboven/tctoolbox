"use client";

import { useEffect, useState } from "react";

export default function Splash() {
  const [weg, setWeg] = useState(false);
  const [verborgen, setVerborgen] = useState(false);

  useEffect(() => {
    // Kort wachten zodat de app-content klaar is met renderen
    const t1 = setTimeout(() => setWeg(true), 300);
    const t2 = setTimeout(() => setVerborgen(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (verborgen) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#840562",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        transition: "opacity 400ms ease",
        opacity: weg ? 0 : 1,
        pointerEvents: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-wit.png" alt="" width={180} style={{ opacity: 0.95 }} />
      <div style={{ display: "flex", gap: "6px" }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.5)",
              animation: `splashPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
