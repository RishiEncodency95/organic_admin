import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export interface DonutDatum {
  key: string;
  label: string;
  value: number;
}

/** Composition-of-a-total (this slice vs. the whole) — a genuinely different job from a
 * magnitude-by-category bar chart, so it earns a different form rather than reusing the bar
 * treatment purely for visual variety. */
export function DonutChart({
  data,
  colorFor,
  valueFormatter,
  emptyLabel,
}: {
  data: DonutDatum[];
  colorFor: (key: string) => string;
  valueFormatter?: (value: number) => string;
  emptyLabel: string;
}) {
  const isEmpty = data.length === 0;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (isEmpty) {
    return (
      <div className="flex h-[168px] items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[14px] border-dashed border-surface-border">
          <p className="px-2 text-center text-xs text-text-muted">{emptyLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={168}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="85%" paddingAngle={3} strokeWidth={0}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={colorFor(entry.key)} />
            ))}
          </Pie>
          <Tooltip content={(props) => <ChartTooltip {...props} valueFormatter={valueFormatter} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {data.map((entry) => (
          <div key={entry.key} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colorFor(entry.key) }} />
            <span className="truncate text-text-secondary">{entry.label}</span>
            <span className="ml-auto shrink-0 font-semibold text-text-primary">
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
