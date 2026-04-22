"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "portfolio-theme-mode";

function applyTheme(next: "dark" | "light") {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(next);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) ?? localStorage.getItem("portfolio-theme");
    const next = saved === "light" ? "light" : "dark";

    applyTheme(next);
    setMode(next);
  }, []);

  function toggle() {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);

    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    localStorage.setItem("portfolio-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-on-surface-variant hover:text-on-surface transition-colors"
      aria-label="Toggle light and dark theme"
    >
      <span className="material-symbols-outlined !text-[18px]">{mode === "dark" ? "light_mode" : "dark_mode"}</span>
    </button>
  );
}
