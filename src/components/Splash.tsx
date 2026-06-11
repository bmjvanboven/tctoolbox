"use client";

import { useEffect } from "react";

export default function SplashRemover() {
  useEffect(() => {
    const el = document.getElementById("tc-splash");
    if (!el) return;
    el.style.transition = "opacity 400ms ease";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    const t = setTimeout(() => el.remove(), 420);
    return () => clearTimeout(t);
  }, []);

  return null;
}
