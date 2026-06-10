"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const WINKELS = ["Gemert", "Deurne", "Asten", "Geldrop", "Veghel"];
const KEY = "tc_locatie";

interface LocatieCtx { locatie: string; setLocatie: (l: string) => void; winkels: string[]; }
const LocatieContext = createContext<LocatieCtx>({ locatie: "", setLocatie: () => {}, winkels: WINKELS });

export function LocatieProvider({ children }: { children: ReactNode }) {
  const [locatie, setLocatieState] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setLocatieState(saved);
  }, []);

  function setLocatie(l: string) {
    setLocatieState(l);
    localStorage.setItem(KEY, l);
  }

  return <LocatieContext.Provider value={{ locatie, setLocatie, winkels: WINKELS }}>{children}</LocatieContext.Provider>;
}

export function useLocatie() { return useContext(LocatieContext); }
