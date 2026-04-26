"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";

export type MapLead = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  status: string;
  source: "home-sale" | "business-filing";
  score: number;
  apprVal: number | null;
  lat: number;
  lng: number;
};

type Props = {
  leads: MapLead[];
  center: { lat: number; lng: number };
};

function colorForScore(score: number): string {
  if (score === 0) return "#f43f5e"; // rose / DNC
  if (score >= 8) return "#10b981"; // emerald — hot
  if (score >= 5) return "#f59e0b"; // amber — warm
  return "#64748b"; // slate — cool
}

function formatMoney(n: number | null): string {
  if (n === null) return "—";
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function LeadsMap({ leads, center }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "home-sale" | "business-filing">(
    "all",
  );
  const [minScore, setMinScore] = useState<number>(0);

  const visibleLeads = useMemo(() => {
    return leads.filter((l) => {
      if (filter !== "all" && l.source !== filter) return false;
      if (l.score < minScore) return false;
      return true;
    });
  }, [leads, filter, minScore]);

  useEffect(() => {
    let cancelled = false;
    let map: L.Map | null = null;
    let markers: L.Marker[] = [];

    async function init() {
      // Dynamic import so Leaflet's window-touching code never runs
      // on the server. The CSS import at module top still gets bundled
      // by Next.js -- it doesn't need `window` to load.
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 10,
        scrollWheelZoom: true,
      });

      L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        },
      ).addTo(map);

      for (const lead of visibleLeads) {
        const color = colorForScore(lead.score);
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([lead.lat, lead.lng], { icon }).addTo(map);

        const isHome = lead.source === "home-sale";
        const valueRow = isHome
          ? `<div style="margin-top:4px;font-size:12px;color:#475569;">Value: <strong style="color:#0f172a;">${formatMoney(
              lead.apprVal,
            )}</strong></div>`
          : "";
        const popup = `
          <div style="font-family:system-ui,sans-serif;min-width:220px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">
              ${isHome ? "Home sale" : "Business"} &middot; Score ${lead.score}/10
            </div>
            <div style="margin-top:4px;font-weight:600;font-size:14px;color:#0f172a;">${escapeHtml(
              lead.name,
            )}</div>
            <div style="margin-top:2px;font-size:12px;color:#475569;">${escapeHtml(
              lead.address ?? "",
            )}</div>
            <div style="font-size:12px;color:#64748b;">
              ${escapeHtml(lead.city ?? "")}${lead.city && lead.state ? ", " : ""}${escapeHtml(lead.state ?? "")}
            </div>
            ${valueRow}
            <div style="margin-top:6px;font-size:11px;">
              <span style="display:inline-block;padding:1px 6px;border-radius:9999px;background:#e0f2fe;color:#0369a1;text-transform:uppercase;letter-spacing:0.05em;">
                ${escapeHtml(lead.status)}
              </span>
            </div>
            <div style="margin-top:8px;">
              <a href="/admin/sales/leads/${lead.id}" style="font-size:12px;color:#0369a1;text-decoration:underline;">Open lead →</a>
            </div>
          </div>
        `;
        marker.bindPopup(popup);
        markers.push(marker);
      }

      // Fit bounds if we have leads, otherwise keep the default Houston
      // center.
      if (visibleLeads.length > 0) {
        const bounds = L.latLngBounds(
          visibleLeads.map((l) => [l.lat, l.lng] as [number, number]),
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }

    init().catch((err) => {
      console.error("[LeadsMap] init failed", err);
      if (!cancelled) setError("Map failed to load. Reload the page to retry.");
    });

    return () => {
      cancelled = true;
      for (const m of markers) m.remove();
      markers = [];
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, [visibleLeads, center]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#1d3554] bg-[#0e2b5c] px-5 py-3 text-sm">
        <div className="flex items-center gap-2 text-[#cfd9e5]">
          <label htmlFor="filter">Show:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as typeof filter)
            }
            className="rounded-md border border-[#1d3554] bg-[#0b1a2e] px-2 py-1 text-sm text-white"
          >
            <option value="all">All sources</option>
            <option value="home-sale">Home sales only</option>
            <option value="business-filing">Businesses only</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-[#cfd9e5]">
          <label htmlFor="minScore">Min score:</label>
          <select
            id="minScore"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="rounded-md border border-[#1d3554] bg-[#0b1a2e] px-2 py-1 text-sm text-white"
          >
            <option value={0}>0+</option>
            <option value={5}>5+ (warm)</option>
            <option value={8}>8+ (hot)</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-[#cfd9e5]">
          <Legend color="#10b981" label="Hot 8-10" />
          <Legend color="#f59e0b" label="Warm 5-7" />
          <Legend color="#64748b" label="Cool 1-4" />
          <Legend color="#f43f5e" label="DNC" />
        </div>
      </div>

      <div className="text-xs text-[#7a8aa0]">
        Showing {visibleLeads.length.toLocaleString()} of{" "}
        {leads.length.toLocaleString()} mappable lead
        {leads.length === 1 ? "" : "s"}. Pin colors reflect lead score; click
        a pin for details.
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="h-[640px] w-full overflow-hidden rounded-xl border border-[#1d3554]"
        style={{ background: "#0b1a2e" }}
      />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color, border: "1px solid white" }}
      />
      {label}
    </span>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
