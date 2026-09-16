"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint } from "@/lib/stats";

const AXIS = {
  stroke: "#7d9188",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #e8dcc6",
  fontSize: 12,
  boxShadow: "0 8px 24px -8px rgba(19,42,34,0.18)",
};

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-ink-900">{title}</h3>
        {subtitle && <p className="text-xs text-ink-600">{subtitle}</p>}
      </div>
      <div className="h-56 w-full">{children}</div>
    </div>
  );
}

export function OrdersBarChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -24, right: 4, top: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee6d6" vertical={false} />
        <XAxis dataKey="label" {...AXIS} interval={Math.max(0, Math.floor(data.length / 6))} />
        <YAxis {...AXIS} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#f3ede0" }} />
        <Bar dataKey="orders" fill="#246b52" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueAreaChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: -18, right: 4, top: 4 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2561f" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f2561f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee6d6" vertical={false} />
        <XAxis dataKey="label" {...AXIS} interval={Math.max(0, Math.floor(data.length / 6))} />
        <YAxis {...AXIS} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `€${value}`} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#dd3f13"
          strokeWidth={2.5}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FoodLineChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: -24, right: 4, top: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee6d6" vertical={false} />
        <XAxis dataKey="label" {...AXIS} interval={Math.max(0, Math.floor(data.length / 6))} />
        <YAxis {...AXIS} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `${value} kg`} />
        <Line
          type="monotone"
          dataKey="foodKg"
          stroke="#358566"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MonthlyImpactChart({
  data,
}: {
  data: { label: string; kg: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -12, right: 4, top: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee6d6" vertical={false} />
        <XAxis dataKey="label" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `${value} kg`} />
        <Bar dataKey="kg" fill="#358566" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
