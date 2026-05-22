"use client";

import { useState } from "react";
import { Property } from "@/lib/types";

export default function AddPropertyModal({
  searchId,
  onClose,
  onAdded,
}: {
  searchId: string;
  onClose: () => void;
  onAdded: (p: Property) => void;
}) {
  const [form, setForm] = useState({
    project_name: "",
    street_address: "",
    price: "",
    beds: "",
    baths: "",
    size_sqft: "",
    psf: "",
    property_type: "Condominium",
    floor_level: "",
    agent_name: "",
    agent_number: "",
    property_link: "",
    source: "PropertyGuru",
    summary: "",
    tenanted: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Build WhatsApp link
    const waText = `Hi!\n\nIs your property at ${form.street_address || form.project_name} still available for co-broke?\n\nI'm from EastCondos. Our client is ready to view.\n\nThank you :)`;
    const whatsapp_link = form.agent_number
      ? `https://web.whatsapp.com/send/?phone=65${form.agent_number.replace(/\D/g, "")}&text=${encodeURIComponent(waText)}`
      : "";

    const payload = {
      search_id: searchId,
      status: "Automation",
      project_name: form.project_name || null,
      street_address: form.street_address || null,
      price: form.price ? parseInt(form.price.replace(/\D/g, "")) : null,
      beds: form.beds ? parseInt(form.beds) : null,
      baths: form.baths ? parseInt(form.baths) : null,
      size_sqft: form.size_sqft ? parseInt(form.size_sqft) : null,
      psf: form.psf ? parseInt(form.psf) : null,
      property_type: form.property_type || null,
      floor_level: form.floor_level || null,
      agent_name: form.agent_name || null,
      agent_number: form.agent_number || null,
      property_link: form.property_link || null,
      source: form.source || null,
      summary: form.summary || null,
      tenanted: form.tenanted || null,
      whatsapp_link: whatsapp_link || null,
    };

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to add listing");
      return;
    }
    const data = await res.json();
    onAdded({ ...data, images: [], notes: [] });
  }

  const inputCls =
    "w-full bg-transparent border-b border-white/20 pb-2 text-cream text-sm placeholder-white/25 focus:outline-none focus:border-amber transition-colors";
  const labelCls = "block text-amber/70 text-xs tracking-kicker uppercase mb-2";
  const sectionLabel = "text-white/30 text-xs tracking-broadsheet uppercase mb-4 flex items-center gap-3";

  return (
    <div className="fixed inset-0 bg-charcoal-deep/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-charcoal border border-white/10 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-premium-lg">

        {/* Header */}
        <div className="sticky top-0 bg-charcoal border-b border-white/10 px-7 py-5 flex items-center justify-between z-10">
          <div>
            <p className="text-amber text-xs tracking-kicker uppercase mb-1">EastCondos</p>
            <h2 className="text-cream text-xl" style={{ fontFamily: "var(--font-dm-serif)" }}>
              Add New Listing
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-sm border border-white/10 text-cream/40 hover:text-cream hover:border-white/30 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-7">

          {/* Section 1 — Property */}
          <div>
            <p className={sectionLabel}>
              <span className="w-5 h-px bg-white/20 inline-block" />
              Property
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className={labelCls}>Project / Estate</label>
                <input className={inputCls} value={form.project_name} onChange={(e) => set("project_name", e.target.value)} placeholder="The Jovell" />
              </div>
              <div>
                <label className={labelCls}>Street Address</label>
                <input className={inputCls} value={form.street_address} onChange={(e) => set("street_address", e.target.value)} placeholder="27 Flora Drive" />
              </div>
              <div>
                <label className={labelCls}>Asking Price (S$)</label>
                <input className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="1,360,000" />
              </div>
              <div>
                <label className={labelCls}>Property Type</label>
                <select
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-cream text-sm focus:outline-none focus:border-amber transition-colors"
                  value={form.property_type}
                  onChange={(e) => set("property_type", e.target.value)}
                  style={{ colorScheme: "dark" }}
                >
                  <option value="Condominium" className="bg-charcoal">Condominium</option>
                  <option value="HDB" className="bg-charcoal">HDB</option>
                  <option value="Executive Condo" className="bg-charcoal">Executive Condo</option>
                  <option value="Landed" className="bg-charcoal">Landed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 — Details */}
          <div>
            <p className={sectionLabel}>
              <span className="w-5 h-px bg-white/20 inline-block" />
              Details
            </p>
            <div className="grid grid-cols-3 gap-x-8 gap-y-5">
              <div>
                <label className={labelCls}>Beds</label>
                <input className={inputCls} type="number" value={form.beds} onChange={(e) => set("beds", e.target.value)} placeholder="3" />
              </div>
              <div>
                <label className={labelCls}>Baths</label>
                <input className={inputCls} type="number" value={form.baths} onChange={(e) => set("baths", e.target.value)} placeholder="2" />
              </div>
              <div>
                <label className={labelCls}>Size (sqft)</label>
                <input className={inputCls} value={form.size_sqft} onChange={(e) => set("size_sqft", e.target.value)} placeholder="904" />
              </div>
              <div>
                <label className={labelCls}>PSF</label>
                <input className={inputCls} value={form.psf} onChange={(e) => set("psf", e.target.value)} placeholder="1,504" />
              </div>
              <div>
                <label className={labelCls}>Floor Level</label>
                <input className={inputCls} value={form.floor_level} onChange={(e) => set("floor_level", e.target.value)} placeholder="High floor" />
              </div>
              <div>
                <label className={labelCls}>Tenancy</label>
                <input className={inputCls} value={form.tenanted} onChange={(e) => set("tenanted", e.target.value)} placeholder="Vacant / Tenanted" />
              </div>
            </div>
          </div>

          {/* Section 3 — Agent */}
          <div>
            <p className={sectionLabel}>
              <span className="w-5 h-px bg-white/20 inline-block" />
              Agent
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className={labelCls}>Agent Name</label>
                <input className={inputCls} value={form.agent_name} onChange={(e) => set("agent_name", e.target.value)} placeholder="John Tan" />
              </div>
              <div>
                <label className={labelCls}>Agent Number</label>
                <input className={inputCls} value={form.agent_number} onChange={(e) => set("agent_number", e.target.value)} placeholder="9123 4567" />
              </div>
            </div>
          </div>

          {/* Section 4 — Links & Notes */}
          <div>
            <p className={sectionLabel}>
              <span className="w-5 h-px bg-white/20 inline-block" />
              Links &amp; Notes
            </p>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>PropertyGuru Link</label>
                <input className={inputCls} value={form.property_link} onChange={(e) => set("property_link", e.target.value)} placeholder="https://www.propertyguru.com.sg/..." />
              </div>
              <div>
                <label className={labelCls}>Summary / Highlights</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-cream text-sm placeholder-white/25 focus:outline-none focus:border-amber transition-colors resize-none min-h-[80px]"
                  value={form.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  placeholder="Key highlights of this listing…"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-2.5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/15 text-cream/60 hover:text-cream hover:border-white/30 text-sm py-3 rounded-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber hover:bg-amber-light text-charcoal font-semibold text-sm py-3 rounded-sm transition-colors disabled:opacity-40"
            >
              {loading ? "Adding…" : "Add Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
