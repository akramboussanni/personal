"use client";

import { useEffect } from "react";

export function AmbientPointer() {
  useEffect(() => {
    const root = document.documentElement;

    function onMove(event: MouseEvent) {
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * 12;
      root.style.setProperty("--grid-shift-x", `${x.toFixed(2)}px`);
      root.style.setProperty("--grid-shift-y", `${y.toFixed(2)}px`);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
