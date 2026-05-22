"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Property, ClientSearch, CLIENT_VISIBLE_STATUSES, STATUS_COLORS } from "@/lib/types";

export default function ClientView({
  search,
  properties,
}: {
  search: Pick<ClientSearch, "id" | "client_name">;
  properties: Property[];
}) {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Property | null>(null);

  const filtered =
    activeStatus === "all"
      ? properties
      : properties.filter((p) => p.status === activeStatus);

  const counts = CLIENT_VISIBLE_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: properties.filter((p) => p.status === s).length }),
    {} as Record<string, number>
  );

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-charcoal">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-amber text-xs tracking-kicker uppercase">EastCondos</p>
            <button
              onClick={handleLogout}
              className="text-cream/30 hover:text-cream text-xs transition-colors"
            >
              Sign out
            </button>
          </div>
          <h1
            className="text-cream text-2xl mb-1"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Your Property Search
          </h1>
          <p className="text-cream/50 text-sm">{search.client_name}</p>

          {/* Stats row */}
          <div className="flex gap-6 mt-5">
            {CLIENT_VISIBLE_STATUSES.map((s) => {
              const colors = STATUS_COLORS[s];
              return (
                <div key={s} className="text-center">
                  <p className="text-cream text-2xl font-semibold">{counts[s] || 0}</p>
                  <p className="text-cream/40 text-xs mt-0.5">{s.replace("V - ", "").replace("NV - ", "")}</p>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="border-b border-charcoal/10 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 flex gap-1 py-1 overflow-x-auto">
          {[{ label: "All", value: "all" }, ...CLIENT_VISIBLE_STATUSES.map((s) => ({ label: s, value: s }))].map(
            ({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveStatus(value)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors rounded-sm ${
                  activeStatus === value
                    ? "text-charcoal border-b-2 border-amber"
                    : "text-body/50 hover:text-body"
                }`}
              >
                {label.replace("V - ", "").replace("NV - ", "")}
                {value !== "all" && (
                  <span className="ml-1.5 text-body/30">{counts[value as keyof typeof counts] || 0}</span>
                )}
              </button>
            )
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-body/30">
            <p className="text-4xl mb-4">🏡</p>
            <p className="text-lg">No properties in this stage yet</p>
            <p className="text-sm mt-1">Your agent is working on it</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((prop) => {
              const colors = STATUS_COLORS[prop.status];
              return (
                <button
                  key={prop.id}
                  onClick={() => setSelected(prop)}
                  className="bg-white border border-charcoal/10 rounded-sm text-left hover:border-amber hover:shadow-premium-glow transition-all overflow-hidden"
                >
                  {/* Image */}
                  {prop.images && prop.images.length > 0 ? (
                    <div className="w-full h-40 bg-paper overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prop.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-paper flex items-center justify-center">
                      <span className="text-body/20 text-3xl">🏢</span>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Status badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-sm ${colors.bg} ${colors.text} ${colors.border} border`}>
                      {prop.status}
                    </span>

                    <h3 className="text-charcoal font-semibold mt-2 mb-0.5">
                      {prop.project_name || prop.street_address || "Property"}
                    </h3>
                    <p className="text-body/50 text-xs">{prop.street_address}</p>

                    <div className="flex items-center gap-3 mt-2">
                      {prop.price && (
                        <span className="text-amber-deep font-semibold text-sm">
                          S$ {prop.price.toLocaleString()}
                        </span>
                      )}
                      {prop.size_sqft && (
                        <span className="text-body/40 text-xs">{prop.size_sqft} sqft</span>
                      )}
                      {prop.psf && (
                        <span className="text-body/40 text-xs">S${prop.psf}/sqft</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-1.5 text-body/40 text-xs">
                      {prop.beds && <span>{prop.beds} bed</span>}
                      {prop.baths && <span>{prop.baths} bath</span>}
                      {prop.floor_level && <span>{prop.floor_level}</span>}
                    </div>

                    {prop.viewing_datetime && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-sm px-2 py-1.5">
                        <p className="text-green-700 text-xs font-medium">
                          📅 Viewing:{" "}
                          {new Date(prop.viewing_datetime).toLocaleDateString("en-SG", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          at{" "}
                          {new Date(prop.viewing_datetime).toLocaleTimeString("en-SG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Property detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-charcoal/60 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-cream rounded-sm w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Images */}
            {selected.images && selected.images.length > 0 && (
              <div className="w-full h-48 bg-paper overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.images[0].url} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2
                    className="text-charcoal text-xl font-semibold"
                    style={{ fontFamily: "var(--font-dm-serif)" }}
                  >
                    {selected.project_name || selected.street_address}
                  </h2>
                  <p className="text-body/50 text-sm mt-0.5">{selected.street_address}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-body/30 hover:text-body text-2xl ml-3"
                >
                  ×
                </button>
              </div>

              {/* Price block */}
              {selected.price && (
                <div className="bg-charcoal rounded-sm px-4 py-3 mb-4">
                  <p className="text-amber text-xl font-semibold">
                    S$ {selected.price.toLocaleString()}
                  </p>
                  {selected.psf && (
                    <p className="text-cream/50 text-xs mt-0.5">S$ {selected.psf}/sqft</p>
                  )}
                </div>
              )}

              {/* Details grid */}
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                {[
                  ["Size", selected.size_sqft ? `${selected.size_sqft} sqft` : null],
                  ["Bedrooms", selected.beds],
                  ["Bathrooms", selected.baths],
                  ["Type", selected.property_type],
                  ["Floor", selected.floor_level],
                  ["Tenancy", selected.tenanted],
                  ["MRT", selected.mrt_distance],
                ].filter(([, v]) => v != null).map(([label, val]) => (
                  <div key={String(label)}>
                    <dt className="text-body/40 text-xs">{label}</dt>
                    <dd className="text-charcoal text-sm font-medium mt-0.5">{String(val)}</dd>
                  </div>
                ))}
              </dl>

              {selected.summary && (
                <p className="text-body/60 text-sm leading-relaxed mb-4 border-t border-charcoal/10 pt-4">
                  {selected.summary}
                </p>
              )}

              {selected.viewing_datetime && (
                <div className="bg-green-50 border border-green-200 rounded-sm px-4 py-3 mb-4">
                  <p className="text-green-800 font-semibold text-sm">
                    📅 Viewing Scheduled
                  </p>
                  <p className="text-green-700 text-sm mt-0.5">
                    {new Date(selected.viewing_datetime).toLocaleDateString("en-SG", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(selected.viewing_datetime).toLocaleTimeString("en-SG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {/* Additional images */}
              {selected.images && selected.images.length > 1 && (
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {selected.images.slice(1).map((img) => (
                    <div key={img.id} className="aspect-square rounded-sm overflow-hidden bg-paper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {selected.notes && selected.notes.length > 0 && (
                <div className="border-t border-charcoal/10 pt-4">
                  <p className="text-body/40 text-xs tracking-broadsheet uppercase mb-2">Notes from your agent</p>
                  <div className="space-y-2">
                    {selected.notes.map((n) => (
                      <div key={n.id} className="bg-paper rounded-sm px-3 py-2">
                        <p className="text-charcoal text-sm leading-relaxed">{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
