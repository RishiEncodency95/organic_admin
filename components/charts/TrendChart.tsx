import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export interface TrendDatum {
  label: string;
  value: number;
}

/** A day-over-day trend — the one job a bar/donut can't do — so it earns the one chart form
 * that isn't a bar or donut: a single accent-hue line, thin, with a recessive grid (dataviz
 * skill's sequential/magnitude treatment carried over to a time series). */
export function TrendChart({ data, valueFormatter }: { data: TrendDatum[]; valueFormatter?: (value: number) => string }) {
  if (data.length < 2) {
    return (
      <p className="flex h-[180px] items-center justify-center text-sm text-text-muted">
        Not enough history yet — check back tomorrow.
      </p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--surface-border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} width={40} />
        <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} cursor={{ stroke: "var(--surface-border)" }} />
        <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "var(--accent)" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
