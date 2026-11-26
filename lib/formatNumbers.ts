/** Display helpers so a long raw number (0.004170313319650328, 387.5000000000009) never stretches a card. */

/** Layout shift: three decimals ("0.004"). */
export const formatCls = (n: number): string => (Math.abs(n) < 0.0005 && n !== 0 ? "<0.001" : n.toFixed(3).replace(/\.?0+$/, "") || "0");

/** Milliseconds as a whole number ("388"). */
export const formatMs = (n: number): string => String(Math.round(n));

/** Any decimal with a long tail inside a text is shortened (0.12345678 -> 0.123, 387.5000000000009 -> 387.5). */
export const tidyNumbers = (text: string): string =>
  text.replace(/\d+\.\d{4,}/g, (m) => {
    const n = Number(m);
    if (!Number.isFinite(n)) return m;
    return n < 1 ? formatCls(n) : String(Math.round(n * 100) / 100);
  });
