"use client";

import { useEffect, useState } from "react";

export default function Splash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setFading(true), 300);
    const remove = setTimeout(() => setVisible(false), 700);
    return () => {
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div id="tc-splash" className={fading ? "tc-splash tc-splash--hidden" : "tc-splash"}>
      <img src="/logo-wit.png" width={180} style={{ opacity: 0.95 }} alt="" />
      <div className="tc-splash-dots">
        <div className="tc-splash-dot" />
        <div className="tc-splash-dot" style={{ animationDelay: ".2s" }} />
        <div className="tc-splash-dot" style={{ animationDelay: ".4s" }} />
      </div>
    </div>
  );
}
