"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DailyPoint,
  LocationCount,
} from "@/lib/analytics/queries";

const AXIS = "#7a8aa0";
const GRID = "#1d3554";
const VIEWS = "#3a94d6";
const SESSIONS = "#60c7b0";
const PHONE = "#3a94d6";
const SCHEDULE = "#f5b94a";

const tooltipStyle = {
  backgroundColor: "#112740",
  border: "1px solid #1d3554",
  borderRadius: 8,
  color: "#e8edf3",
  fontSize: 13,
};

export function TrafficChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: AXIS }}
          stroke={AXIS}
          interval={4}
        />
        <YAxis
          tick={{ fontSize: 11, fill: AXIS }}
          stroke={AXIS}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} />
        <Line
          type="monotone"
          dataKey="views"
          stroke={VIEWS}
          strokeWidth={2}
          name="Page Views"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="sessions"
          stroke={SESSIONS}
          strokeWidth={2}
          name="Sessions"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CtaLocationChart({ data }: { data: LocationCount[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis
          dataKey="location"
          tick={{ fontSize: 11, fill: AXIS }}
          stroke={AXIS}
        />
        <YAxis
          tick={{ fontSize: 11, fill: AXIS }}
          stroke={AXIS}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} />
        <Bar
          dataKey="phone"
          fill={PHONE}
          name="Phone Calls"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="schedule"
          fill={SCHEDULE}
          name="Schedule Clicks"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
