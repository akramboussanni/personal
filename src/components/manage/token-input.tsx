"use client";

import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const TOKEN_KEY = "portfolio_admin_token";

export function TokenInput({ value, onChange }: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (stored && !value) {
      onChange(stored);
    }
    setLoaded(true);
  }, [onChange, value]);

  function handleToken(next: string) {
    onChange(next);
    window.localStorage.setItem(TOKEN_KEY, next);
  }

  return (
    <section className="bg-surface-container border border-outline-variant/30 p-4 mb-6">
      <label className="font-label text-[10px] uppercase tracking-[0.2em] text-neutral-500 block mb-2">Admin Token</label>
      <input
        value={value}
        onChange={(e) => handleToken(e.target.value)}
        className="w-full bg-surface-container-low border border-outline-variant/40 p-3 text-sm text-on-surface"
        placeholder={loaded ? "Leave empty if token is not configured" : "Loading token..."}
      />
    </section>
  );
}
