"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"team" | "client">("team");
  const [password, setPassword] = useState("");
  const [clientSlug, setClientSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, password, clientSlug }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Invalid password");
      return;
    }

    router.push(data.redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Masthead */}
        <div className="text-center mb-10">
          <p className="text-amber text-xs tracking-kicker uppercase mb-3">EastCondos</p>
          <h1
            className="text-cream text-3xl"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Property Search
          </h1>
          <div className="w-12 h-px bg-amber mx-auto mt-4" />
        </div>

        {/* Mode toggle */}
        <div className="flex border border-white/10 rounded-sm mb-8 overflow-hidden">
          <button
            type="button"
            onClick={() => { setMode("team"); setError(""); }}
            className={`flex-1 py-2.5 text-sm font-medium tracking-wide transition-colors ${
              mode === "team"
                ? "bg-amber text-charcoal"
                : "text-cream/60 hover:text-cream"
            }`}
          >
            Team Login
          </button>
          <button
            type="button"
            onClick={() => { setMode("client"); setError(""); }}
            className={`flex-1 py-2.5 text-sm font-medium tracking-wide transition-colors ${
              mode === "client"
                ? "bg-amber text-charcoal"
                : "text-cream/60 hover:text-cream"
            }`}
          >
            Client Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "client" && (
            <div>
              <label className="block text-cream/60 text-xs tracking-broadsheet uppercase mb-2">
                Your Search ID
              </label>
              <input
                type="text"
                value={clientSlug}
                onChange={(e) => setClientSlug(e.target.value.toLowerCase())}
                placeholder="e.g. hairul-nuraini"
                className="w-full bg-charcoal-light border border-white/10 rounded-sm px-4 py-3 text-cream placeholder-cream/30 text-sm focus:outline-none focus:border-amber transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-cream/60 text-xs tracking-broadsheet uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-charcoal-light border border-white/10 rounded-sm px-4 py-3 text-cream placeholder-cream/30 text-sm focus:outline-none focus:border-amber transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber hover:bg-amber-light text-charcoal font-semibold py-3 rounded-sm text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
