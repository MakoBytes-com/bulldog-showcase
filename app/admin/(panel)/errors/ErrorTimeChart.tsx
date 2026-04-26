"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SeriesRow = {
  bucket: string;
  level: string;
  count: number;
};

type ChartPoint = {
  bucket: string;
  bucketLabel: string;
  error: number;
  warn: number;
};

export function ErrorTimeChart({ series }: { series: SeriesRow[] }) {
  // Pivot the (bucket, level) rows into a single chart point per bucket
  const data: ChartPoint[] = useMemo(() => {
    const map = new Map<string, ChartPoint>();
    for (const row of series) {
      const key = row.bucket;
      const existing = map.get(key);
      if (existing) {
        if (row.level === "error") existing.error += row.count;
        else if (row.level === "warn") existing.warn += row.count;
      } else {
        const d = new Date(row.bucket);
        map.set(key, {
          bucket: row.bucket,
          bucketLabel: d.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            hour12: true,
          }),
          error: row.level === "error" ? row.count : 0,
          warn: row.level === "warn" ? row.count : 0,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.bucket.localeCompare(b.bucket),
    );
  }, [series]);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[#9fb0c7]">
        No errors in the last 7 days. Healthy.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        <CartesianGrid stroke="#1d3554" vertical={false} />
        <XAxis
          dataKey="bucketLabel"
          stroke="#7a8aa0"
          fontSize={11}
          tickMargin={6}
          interval="preserveStartEnd"
        />
        <YAxis stroke="#7a8aa0" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0e2b5c",
            border: "1px solid #1d3554",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#cfd9e5" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#cfd9e5" }}
          iconType="square"
        />
        <Bar dataKey="warn" stackId="a" fill="#f59e0b" name="Warnings" />
        <Bar dataKey="error" stackId="a" fill="#ef4444" name="Errors" />
      </BarChart>
    </ResponsiveContainer>
  );
}
