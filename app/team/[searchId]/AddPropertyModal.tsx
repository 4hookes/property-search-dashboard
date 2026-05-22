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
    "w-full border border-charcoal/20 bg-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber transition-colors";
  const labelCls = "block text-body/50 text-xs tracking-broadsheet uppercase mb-1.5";

  return (
    <div className="fixed inset-0 bg-charcoal/70 flex items-center justify-center z-50 px-4">
      <div className="bg-cream border border-charcoal/10 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-cream border-b border-charcoal/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-charcoal text-xl font-semibold" style={{ fontFamily: "var(--font-dm-serif)" }}>
            Add Listing
          </h2>
          <button onClick={onClose} className="text-body/40 hover:text-body text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Project / Estate</label>
              <input className={inputCls} value={form.project_name} onChange={(e) => set("project_name", e.target.value)} placeholder="The Jovell" />
            </div>
            <div>
              <label className={labelCls}>Street Address</label>
              <input className={inputCls} value={form.street_address} onChange={(e) => set("street_address", e.target.value)} placeholder="27 Flora Drive" />
            </div>
            <div>
              <label className={labelCls}>Price (S$)</label>
              <input className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="1,360,000" />
            </div>
            <div>
              <label className={labelCls}>Property Type</label>
              <select className={inputCls} value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>
                <option>Condominium</option>
                <option>HDB</option>
                <option>Executive Condo</option>
                <option>Landed</option>
              </select>
            </div>
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
              <input className={inputCls} value={form.psf} onChange={(e) => set("psf", e.target.value)} placeholder="1504" />
            </div>
            <div>
              <label className={labelCls}>Floor Level</label>
              <input className={inputCls} value={form.floor_level} onChange={(e) => set("floor_level", e.target.value)} placeholder="High floor" />
            </div>
            <div>
              <label className={labelCls}>Tenanted</label>
              <input className={inputCls} value={form.tenanted} onChange={(e) => set("tenanted", e.target.value)} placeholder="Vacant / Tenanted" />
            </div>
            <div>
              <label className={labelCls}>Agent Name</label>
              <input className={inputCls} value={form.agent_name} onChange={(e) => set("agent_name", e.target.value)} placeholder="John Tan" />
            </div>
            <div>
              <label className={labelCls}>Agent Number</label>
              <input className={inputCls} value={form.agent_number} onChange={(e) => set("agent_number", e.target.value)} placeholder="9123 4567" />
            </div>
          </div>

          <div>
            <label className={labelCls}>PropertyGuru Link</label>
            <input className={inputCls} value={form.property_link} onChange={(e) => set("property_link", e.target.value)} placeholder="https://www.propertyguru.com.sg/..." />
          </div>
          <div>
            <label className={labelCls}>Summary / Notes</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="Key highlights of this listing…"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-charcoal/20 text-body text-sm py-2.5 rounded-sm hover:bg-paper transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-charcoal text-cream text-sm py-2.5 rounded-sm hover:bg-charcoal-light transition-colors disabled:opacity-50"
            >
              {loading ? "Adding…" : "Add Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
