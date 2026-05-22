"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientSearch } from "@/lib/types";

type SearchSummary = Pick<ClientSearch, "id" | "client_name" | "client_slug" | "is_active" | "created_at">;

export default function TeamDashboard({ searches }: { searches: SearchSummary[] }) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ client_name: "", client_slug: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed");
      return;
    }
    setShowNew(false);
    setForm({ client_name: "", client_slug: "", password: "" });
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-charcoal border-b border-white/10">
        <div className="max-w-broadsheet mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-amber text-xs tracking-kicker uppercase">EastCondos</span>
            <span className="text-white/20">|</span>
            <span className="text-cream/70 text-sm">Property Search</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-cream/40 hover:text-cream text-xs tracking-wide transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-broadsheet mx-auto px-6 py-12">
        {/* Page heading */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-amber-deep text-xs tracking-kicker uppercase mb-2">Team Dashboard</p>
            <h1 className="text-charcoal text-3xl" style={{ fontFamily: "var(--font-dm-serif)" }}>
              Client Searches
            </h1>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="bg-charcoal hover:bg-charcoal-light text-cream text-sm font-medium px-5 py-2.5 rounded-sm transition-colors"
          >
            + New Search
          </button>
        </div>

        {/* Search cards */}
        {searches.length === 0 ? (
          <div className="text-center py-24 text-body/40">
            <p className="text-lg mb-2">No client searches yet</p>
            <p className="text-sm">Create one to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searches.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/team/${s.id}`)}
                className="bg-white border border-charcoal/10 rounded-sm p-6 text-left hover:border-amber hover:shadow-premium-glow transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`text-xs tracking-kicker uppercase px-2 py-1 rounded-sm ${
                      s.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {s.is_active ? "Active" : "Closed"}
                  </div>
                  <span className="text-charcoal/20 group-hover:text-amber transition-colors text-lg">→</span>
                </div>
                <h3 className="text-charcoal font-semibold text-lg mb-1">{s.client_name}</h3>
                <p className="text-body/50 text-xs font-mono">{s.client_slug}</p>
                <p className="text-body/40 text-xs mt-3">
                  {new Date(s.created_at).toLocaleDateString("en-SG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* New search modal */}
      {showNew && (
        <div className="fixed inset-0 bg-charcoal/70 flex items-center justify-center z-50 px-4">
          <div className="bg-cream border border-charcoal/10 rounded-sm w-full max-w-md p-8">
            <h2
              className="text-charcoal text-2xl mb-6"
              style={{ fontFamily: "var(--font-dm-serif)" }}
            >
              New Client Search
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-body/60 text-xs tracking-broadsheet uppercase mb-1.5">
                  Client Name
                </label>
                <input
                  type="text"
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="Hairul & Nuraini"
                  className="w-full border border-charcoal/20 bg-white rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-amber transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-body/60 text-xs tracking-broadsheet uppercase mb-1.5">
                  Search ID (URL slug)
                </label>
                <input
                  type="text"
                  value={form.client_slug}
                  onChange={(e) =>
                    setForm({ ...form, client_slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                  }
                  placeholder="hairul-nuraini"
                  className="w-full border border-charcoal/20 bg-white rounded-sm px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-amber transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-body/60 text-xs tracking-broadsheet uppercase mb-1.5">
                  Client Password
                </label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Simple password for client"
                  className="w-full border border-charcoal/20 bg-white rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-amber transition-colors"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowNew(false); setError(""); }}
                  className="flex-1 border border-charcoal/20 text-body text-sm py-2.5 rounded-sm hover:bg-paper transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-charcoal text-cream text-sm py-2.5 rounded-sm hover:bg-charcoal-light transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
