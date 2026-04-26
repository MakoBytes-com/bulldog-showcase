import { and, eq, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { fallbackCenter, geocodeLead, jitter } from "@/lib/geocodes";
import { scoreLead } from "@/lib/leadScoring";
import { Card } from "../../../_components/ui";

import { LeadsMap, type MapLead } from "./LeadsMap";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead map" };

const HAS_ADDRESS = sql`${schema.salesLeads.address} ~ '^[0-9]'`;

export default async function MapPage() {
  // Pull every address-having, non-DNC lead so the map shows the
  // entire pipeline at a glance. We dedupe by upper(address) the same
  // way the list views do; a property with three deeds shouldn't show
  // up as three pins.
  const rawLeads = await db
    .select()
    .from(schema.salesLeads)
    .where(
      and(
        HAS_ADDRESS,
        eq(schema.salesLeads.internalDoNotContact, false),
      ),
    )
    .orderBy(schema.salesLeads.id);

  const seen = new Set<string>();
  const deduped: typeof rawLeads = [];
  for (const lead of rawLeads) {
    const key = (lead.address ?? "").toUpperCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(lead);
  }

  // Geocode each lead from its city (with deterministic per-id jitter
  // so multiple leads in the same city don't stack). Anything we
  // can't place is dropped from the map but still lives in the
  // pipeline.
  const mapped: MapLead[] = [];
  let unmapped = 0;
  for (const lead of deduped) {
    const base = geocodeLead({ city: lead.city, state: lead.state });
    if (!base) {
      unmapped++;
      continue;
    }
    const { lat, lng } = jitter(base, lead.id);
    const meta = (lead.metadata ?? {}) as Record<string, unknown>;
    const hcad = (meta.hcad ?? {}) as Record<string, unknown>;
    const apprVal = typeof hcad.apprVal === "number" ? hcad.apprVal : null;
    const score = scoreLead(lead).total;
    mapped.push({
      id: lead.id,
      name: lead.name,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      status: lead.status,
      source: lead.source as "home-sale" | "business-filing",
      score,
      apprVal,
      lat,
      lng,
    });
  }

  const center = fallbackCenter();

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">Lead map</h2>
        <p className="mt-2 text-sm text-[#cfd9e5]">
          Geographic distribution of every active prospect across the
          Houston metro. Use the filters to focus on home sales, hot
          leads (8+), or businesses. Pin colors reflect lead score
          (Value × Match × Freshness for home sales, Source × Freshness
          for businesses).
        </p>
        {unmapped > 0 ? (
          <p className="mt-2 text-xs text-[#7a8aa0]">
            Note: {unmapped} {unmapped === 1 ? "lead" : "leads"} couldn&rsquo;t
            be placed on the map (city not in the centroid table).
            They&rsquo;re still tracked in the list views.
          </p>
        ) : null}
      </Card>

      <LeadsMap leads={mapped} center={center} />
    </div>
  );
}
