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
        <div className="px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/team")}
              className="flex items-center gap-1.5 text-cream/30 hover:text-cream/80 text-xs transition-colors group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              <span>All Searches</span>
            </button>
            <span className="text-white/10">|</span>
            <span className="text-amber text-xs tracking-kicker uppercase font-medium">EastCondos</span>
            <span className="text-white/10">/</span>
            <span className="text-cream font-semibold text-sm">{search.client_name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-cream/30 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber/60" />
              <span>{properties.length} listing{properties.length !== 1 ? "s" : ""}</span>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-amber hover:bg-amber-light text-charcoal text-xs font-bold px-4 py-2 rounded-sm transition-colors tracking-wide"
            >
              + Add Listing
            </button>
          </div>
        </div>
      </header>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden flex">
        <div className="kanban-scroll flex gap-4 p-5 flex-1 items-start">
          {PIPELINE_STATUSES.map((status) => {
            const cols = byStatus(status);
            const isOutcome = status === "V - Shortlisted" || status === "V - Not Interested" || status === "NV - Not Suitable" || status === "Unavailable";
            const accentColor =
              status === "V - Shortlisted" ? "bg-amber" :
              status === "Viewing Confirmed" ? "bg-green-400" :
              status === "Arranging" ? "bg-yellow-400" :
              status === "Waiting for Reply" ? "bg-blue-400" :
              status === "V - Not Interested" ? "bg-red-400" :
              status === "Unavailable" ? "bg-gray-500" :
              "bg-white/20";

            return (
              <div key={status} className="flex-shrink-0 w-60 flex flex-col">
                {/* Column header */}
                <div className={`mb-3 px-3 py-2.5 rounded-sm flex items-center justify-between ${isOutcome ? "bg-white/3" : "bg-white/5"} border border-white/8`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${accentColor}`} />
                    <span className="text-cream/70 text-xs font-medium truncate">{status}</span>
                  </div>
                  <span className={`text-xs font-semibold ml-2 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${cols.length > 0 ? "bg-white/10 text-cream" : "text-cream/20"}`}>
                    {cols.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2">
                  {cols.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => setSelected(prop)}
                      className={`group rounded-sm text-left transition-all overflow-hidden ${
                        selected?.id === prop.id
                          ? "ring-1 ring-amber shadow-premium-glow"
                          : "hover:ring-1 hover:ring-white/20"
                      }`}
                    >
                      {/* Image */}
                      {prop.images && prop.images.length > 0 ? (
                        <div className="w-full h-28 bg-charcoal-light overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={prop.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="w-full h-16 bg-charcoal-light flex items-center justify-center">
                          <span className="text-white/10 text-2xl">🏢</span>
                        </div>
                      )}

                      {/* Card body */}
                      <div className={`p-3 ${selected?.id === prop.id ? "bg-charcoal-light" : "bg-charcoal-light/80 group-hover:bg-charcoal-light"} transition-colors`}>
                        <p className="text-cream font-medium text-xs leading-snug mb-1.5 line-clamp-2">
                          {prop.project_name || prop.street_address || "Untitled"}
                        </p>
                        {prop.price && (
                          <p className="text-amber text-xs font-semibold">
                            S$ {prop.price.toLocaleString()}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-cream/30 text-xs">
                          {prop.beds && <span>{prop.beds}bd</span>}
                          {prop.baths && <span>{prop.baths}ba</span>}
                          {prop.size_sqft && <span>{prop.size_sqft} sqft</span>}
                        </div>
                        {prop.viewing_datetime && (
                          <div className="flex items-center gap-1 mt-2 bg-green-500/10 border border-green-500/20 rounded-sm px-2 py-1">
                            <span className="text-green-400 text-xs">📅</span>
                            <span className="text-green-400 text-xs font-medium">
                              {new Date(prop.viewing_datetime).toLocaleDateString("en-SG", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

                  {cols.length === 0 && (
                    <div className="border border-dashed border-white/8 rounded-sm h-20 flex items-center justify-center">
                      <span className="text-cream/15 text-xs">No listings</span>
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
