"use client";

import { useState, useRef } from "react";
import { Property, PropertyStatus, PIPELINE_STATUSES, STATUS_COLORS } from "@/lib/types";

export default function PropertyPanel({
  property,
  onClose,
  onStatusChange,
  onPropertyUpdated,
  onPropertyDeleted,
}: {
  property: Property;
  onClose: () => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onPropertyUpdated: (p: Property) => void;
  onPropertyDeleted: (id: string) => void;
}) {
  const [note, setNote] = useState("");
  const [viewingDate, setViewingDate] = useState(
    property.viewing_datetime ? property.viewing_datetime.slice(0, 16) : ""
  );
  const [savingNote, setSavingNote] = useState(false);
  const [savingViewing, setSavingViewing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notes, setNotes] = useState(property.notes || []);
  const [images, setImages] = useState(property.images || []);
  const fileRef = useRef<HTMLInputElement>(null);
  const colors = STATUS_COLORS[property.status];

  async function submitNote() {
    if (!note.trim()) return;
    setSavingNote(true);
    const res = await fetch(`/api/properties/${property.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note }),
    });
    if (res.ok) {
      const newNote = await res.json();
      setNotes((prev) => [...prev, newNote]);
      setNote("");
    }
    setSavingNote(false);
  }

  async function saveViewing() {
    setSavingViewing(true);
    const res = await fetch(`/api/properties/${property.id}/viewing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewing_datetime: viewingDate || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      onPropertyUpdated({ ...property, viewing_datetime: updated.viewing_datetime, notes, images });
    }
    setSavingViewing(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/properties/${property.id}/images`, {
      method: "POST",
      body: fd,
    });
    if (res.ok) {
      const img = await res.json();
      setImages((prev) => [...prev, img]);
    }
    setUploadingImage(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function deleteImage(imageId: string, storagePath: string | null) {
    await fetch(`/api/properties/${property.id}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId, storagePath }),
    });
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  }

  async function handleDelete() {
    if (!confirm("Delete this listing?")) return;
    const res = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
    if (res.ok) onPropertyDeleted(property.id);
  }

  const fmt = (val: string | number | null | undefined, prefix = "", suffix = "") =>
    val != null && val !== "" ? `${prefix}${val}${suffix}` : "—";

  return (
    <div className="w-96 bg-cream border-l border-charcoal/10 flex flex-col overflow-hidden flex-shrink-0">
      {/* Panel header */}
      <div className="bg-charcoal px-5 py-4 flex items-start justify-between flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-cream font-semibold text-sm leading-snug truncate">
            {property.project_name || property.street_address || "Untitled"}
          </p>
          <p className="text-cream/40 text-xs mt-0.5">{property.street_address || ""}</p>
        </div>
        <button onClick={onClose} className="text-cream/30 hover:text-cream ml-3 text-lg leading-none">×</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Status change */}
        <div className="px-5 py-4 border-b border-charcoal/10">
          <label className="block text-body/50 text-xs tracking-broadsheet uppercase mb-2">Status</label>
          <select
            value={property.status}
            onChange={(e) => onStatusChange(property.id, e.target.value as PropertyStatus)}
            className={`w-full border rounded-sm px-3 py-2 text-sm font-medium focus:outline-none focus:border-amber transition-colors ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {PIPELINE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Key details */}
        <div className="px-5 py-4 border-b border-charcoal/10">
          <p className="text-body/50 text-xs tracking-broadsheet uppercase mb-3">Details</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              ["Price", property.price ? `S$ ${property.price.toLocaleString()}` : "—"],
              ["PSF", fmt(property.psf, "S$ ", " psf")],
              ["Size", fmt(property.size_sqft, "", " sqft")],
              ["Beds / Baths", `${property.beds ?? "—"} / ${property.baths ?? "—"}`],
              ["Type", fmt(property.property_type)],
              ["Level", fmt(property.floor_level)],
              ["Tenanted", fmt(property.tenanted)],
              ["MRT", fmt(property.mrt_distance)],
              ["Source", fmt(property.source)],
            ].map(([label, val]) => (
              <div key={label}>
                <dt className="text-body/40 text-xs">{label}</dt>
                <dd className="text-charcoal text-xs font-medium mt-0.5">{val}</dd>
              </div>
            ))}
          </dl>
          {property.summary && (
            <p className="text-body/60 text-xs mt-3 leading-relaxed">{property.summary}</p>
          )}
        </div>

        {/* Agent */}
        <div className="px-5 py-4 border-b border-charcoal/10">
          <p className="text-body/50 text-xs tracking-broadsheet uppercase mb-2">Agent</p>
          <p className="text-charcoal text-sm font-medium">{property.agent_name || "—"}</p>
          {property.agent_number && (
            <p className="text-body/50 text-xs mt-0.5">{property.agent_number}</p>
          )}
          {property.whatsapp_link && (
            <a
              href={property.whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-green-600 font-medium hover:text-green-700 transition-colors"
            >
              <span>💬</span> WhatsApp Agent
            </a>
          )}
          {property.property_link && (
            <a
              href={property.property_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 text-xs text-amber-deep hover:text-amber font-medium transition-colors"
            >
              View on PropertyGuru →
            </a>
          )}
        </div>

        {/* Viewing */}
        <div className="px-5 py-4 border-b border-charcoal/10">
          <p className="text-body/50 text-xs tracking-broadsheet uppercase mb-2">Viewing Date & Time</p>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={viewingDate}
              onChange={(e) => setViewingDate(e.target.value)}
              className="flex-1 border border-charcoal/20 bg-white rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-amber transition-colors"
            />
            <button
              onClick={saveViewing}
              disabled={savingViewing}
              className="bg-charcoal text-cream text-xs px-3 py-2 rounded-sm hover:bg-charcoal-light transition-colors disabled:opacity-50"
            >
              {savingViewing ? "…" : "Save"}
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="px-5 py-4 border-b border-charcoal/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-body/50 text-xs tracking-broadsheet uppercase">Images</p>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImage}
              className="text-amber-deep text-xs font-medium hover:text-amber transition-colors disabled:opacity-50"
            >
              {uploadingImage ? "Uploading…" : "+ Upload"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-sm overflow-hidden bg-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => deleteImage(img.id, img.storage_path)}
                    className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-cream text-xs transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body/30 text-xs">No images yet</p>
          )}
        </div>

        {/* Notes */}
        <div className="px-5 py-4 border-b border-charcoal/10">
          <p className="text-body/50 text-xs tracking-broadsheet uppercase mb-3">Notes</p>
          {notes.length > 0 && (
            <div className="space-y-2 mb-3">
              {notes.map((n) => (
                <div key={n.id} className="bg-paper border border-charcoal/10 rounded-sm px-3 py-2">
                  <p className="text-charcoal text-xs leading-relaxed">{n.content}</p>
                  <p className="text-body/30 text-xs mt-1">
                    {new Date(n.created_at).toLocaleString("en-SG", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitNote()}
              placeholder="Add a note…"
              className="flex-1 border border-charcoal/20 bg-white rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-amber transition-colors"
            />
            <button
              onClick={submitNote}
              disabled={savingNote || !note.trim()}
              className="bg-charcoal text-cream text-xs px-3 py-2 rounded-sm hover:bg-charcoal-light transition-colors disabled:opacity-40"
            >
              {savingNote ? "…" : "Add"}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="px-5 py-4">
          <button
            onClick={handleDelete}
            className="text-red-400 text-xs hover:text-red-600 transition-colors"
          >
            Delete listing
          </button>
        </div>
      </div>
    </div>
  );
}
