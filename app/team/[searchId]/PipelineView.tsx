"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Property,
  ClientSearch,
  PIPELINE_STATUSES,
  PropertyStatus,
  STATUS_COLORS,
} from "@/lib/types";
import PropertyPanel from "./PropertyPanel";
import AddPropertyModal from "./AddPropertyModal";

export default function PipelineView({
  search,
  initialProperties,
}: {
  search: Pick<ClientSearch, "id" | "client_name" | "client_slug">;
  initialProperties: Property[];
}) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [selected, setSelected] = useState<Property | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const byStatus = (status: PropertyStatus) =>
    properties.filter((p) => p.status === status);

  async function handleStatusChange(propertyId: string, newStatus: PropertyStatus) {
    const res = await fetch(`/api/properties/${propertyId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
      );
      if (selected?.id === propertyId) {
        setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    }
  }

  async function handlePropertyAdded(newProp: Property) {
    setProperties((prev) => [newProp, ...prev]);
    setShowAdd(false);
  }

  async function handlePropertyUpdated(updated: Property) {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelected(updated);
  }

  async function handlePropertyDeleted(propertyId: string) {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    setSelected(null);
  }

  return (
    <div className="min-h-screen bg-charcoal-deep flex flex-col">
      {/* Header */}
      <header className="bg-charcoal border-b border-white/10 flex-shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/team")}
              className="text-cream/40 hover:text-cream text-sm transition-colors"
            >
              ← Back
            </button>
            <span className="text-white/20">|</span>
            <span className="text-amber text-xs tracking-kicker uppercase">EastCondos</span>
            <span className="text-white/20">/</span>
            <span className="text-cream font-medium">{search.client_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cream/40 text-xs font-mono">{properties.length} listings</span>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-amber hover:bg-amber-light text-charcoal text-xs font-semibold px-4 py-2 rounded-sm transition-colors"
            >
              + Add Listing
            </button>
          </div>
        </div>
      </header>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden flex">
        <div className="kanban-scroll flex gap-3 p-4 flex-1">
          {PIPELINE_STATUSES.map((status) => {
            const cols = byStatus(status);
            const colors = STATUS_COLORS[status];
            return (
              <div
                key={status}
                className="flex-shrink-0 w-64 flex flex-col"
              >
                {/* Column header */}
                <div className="mb-2 px-1 flex items-center justify-between">
                  <span className="text-cream/70 text-xs font-medium truncate">{status}</span>
                  <span className="text-cream/30 text-xs ml-2">{cols.length}</span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 flex-1">
                  {cols.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => setSelected(prop)}
                      className={`bg-white border-l-2 rounded-sm p-3 text-left hover:shadow-premium transition-all ${
                        selected?.id === prop.id
                          ? "border-amber shadow-premium-glow"
                          : `border-transparent hover:border-amber/40`
                      }`}
                    >
                      {/* Image preview */}
                      {prop.images && prop.images.length > 0 && (
                        <div className="w-full h-24 rounded-sm overflow-hidden mb-2 bg-paper">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prop.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-charcoal font-semibold text-xs leading-tight mb-1 line-clamp-2">
                        {prop.project_name || prop.street_address || "Untitled"}
                      </p>
                      {prop.price && (
                        <p className="text-amber-deep text-xs font-medium">
                          S$ {prop.price.toLocaleString()}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-body/40 text-xs">
                        {prop.beds && <span>{prop.beds}br</span>}
                        {prop.size_sqft && <span>{prop.size_sqft} sqft</span>}
                      </div>
                      {prop.viewing_datetime && (
                        <p className="text-green-600 text-xs mt-1.5 font-medium">
                          📅 {new Date(prop.viewing_datetime).toLocaleDateString("en-SG", {
                            day: "numeric", month: "short",
                          })}
                        </p>
                      )}
                      {/* Status badge */}
                      <div className="mt-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded-sm ${colors.bg} ${colors.text}`}>
                          {status}
                        </span>
                      </div>
                    </button>
                  ))}

                  {cols.length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-sm h-16 flex items-center justify-center">
                      <span className="text-cream/20 text-xs">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <PropertyPanel
            property={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onPropertyUpdated={handlePropertyUpdated}
            onPropertyDeleted={handlePropertyDeleted}
          />
        )}
      </div>

      {showAdd && (
        <AddPropertyModal
          searchId={search.id}
          onClose={() => setShowAdd(false)}
          onAdded={handlePropertyAdded}
        />
      )}
    </div>
  );
}
