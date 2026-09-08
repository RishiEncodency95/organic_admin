export function ChartTooltip({
  active,
  payload,
  valueFormatter,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: { label: string; value: number } }>;
  valueFormatter?: (value: number) => string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  const { label, value } = datum;
  return (
    <div className="border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs shadow-lg">
      <p className="font-semibold text-text-primary">{label}</p>
      <p className="text-text-secondary">{valueFormatter ? valueFormatter(value) : value}</p>
    </div>
  );
}
