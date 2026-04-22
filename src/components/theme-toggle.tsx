"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme-mode");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      setMode("light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      setMode("dark");
    }
  }, []);

  function toggle() {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);

    if (next === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }

    localStorage.setItem("portfolio-theme-mode", next);
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
