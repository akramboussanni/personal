"use client";

import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

type SessionState = {
  authenticated: boolean;
  configured: boolean;
};

export function ManageAuthGate({ children }: Props) {
  const [state, setState] = useState<"loading" | "ready">("loading");
  const [session, setSession] = useState<SessionState>({ authenticated: false, configured: true });
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  async function loadSession() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Session check failed with status ${res.status}`);
      }
      const data = (await res.json()) as SessionState;
      setSession(data);
      setNotice("");
    } catch {
      setSession({ authenticated: false, configured: true });
      setNotice("Could not verify session. You can still log in below.");
    } finally {
      setState("ready");
    }
  }

  useEffect(() => {
    void loadSession();
  }, []);

  async function login() {
    setNotice("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      setNotice("Invalid credentials.");
      return;
    }

    setPassword("");
    await loadSession();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    await loadSession();
  }

  if (state === "loading") {
    return <div className="text-on-surface-variant text-sm">Checking admin session...</div>;
  }

  if (!session.configured) {
    return <>{children}</>;
  }

  if (!session.authenticated) {
    return (
      <section className="max-w-md bg-surface-container border border-outline-variant/30 p-5 space-y-3">
        <h2 className="font-headline uppercase tracking-widest">Admin Login</h2>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Password" />
        <div className="flex items-center gap-3">
          <button onClick={() => void login()} className="px-4 py-2 uppercase tracking-widest text-xs border border-[var(--accent,#39ff88)] bg-surface-container-high hover:bg-surface-container-highest transition-colors">Log In</button>
          <span className="text-xs text-on-surface-variant">{notice}</span>
        </div>
      </section>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button onClick={() => void logout()} className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]">Log Out</button>
      </div>
      {children}
    </div>
  );
}
