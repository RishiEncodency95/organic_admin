import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export interface MagnitudeDatum {
  label: string;
  value: number;
}

// A few placeholder rows so the empty state reserves the exact same footprint a populated chart
// would take — never real numbers, just enough rows to show the frame at true size.
const EMPTY_PLACEHOLDER_ROWS: MagnitudeDatum[] = [{ label: "", value: 0 }, { label: "", value: 0 }, { label: "", value: 0 }];

/** A single hue for magnitude-by-category — these bars compare size within one measure (case
 * counts, donation totals), not distinct identities that need their own hues (dataviz skill:
 * sequential/magnitude gets one hue, not a categorical palette). */
export function MagnitudeBarChart({
  data,
  valueFormatter,
  emptyLabel,
}: {
  data: MagnitudeDatum[];
  valueFormatter?: (value: number) => string;
  emptyLabel: string;
}) {
  const isEmpty = data.length === 0;
  const rows = isEmpty ? EMPTY_PLACEHOLDER_ROWS : data;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={Math.max(140, rows.length * 34)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap={12}>
          <CartesianGrid horizontal={false} stroke="var(--surface-border)" />
          <XAxis type="number" hide domain={isEmpty ? [0, 1] : undefined} />
          <YAxis
            type="category"
            dataKey="label"
            width={112}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          />
          {!isEmpty && (
            <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} cursor={{ fill: "var(--surface-sunken)" }} />
          )}
          <Bar
            dataKey="value"
            fill={isEmpty ? "var(--surface-sunken)" : "var(--accent)"}
            radius={[0, 4, 4, 0]}
            maxBarSize={16}
            isAnimationActive={!isEmpty}
          />
        </BarChart>
      </ResponsiveContainer>
      {isEmpty && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-text-muted">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}
