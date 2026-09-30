"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { expoApi, type ChoiceOption, type StallRate } from "@/lib/expoApi";
import { errorText, inputClass } from "./shared";

const CURRENCIES = ["INR", "USD"] as const;
type Currency = (typeof CURRENCIES)[number];
// Only boxes the admin has typed in; every other box shows the saved rate.
type Edits = Record<string, Partial<Record<Currency, string>>>;

/**
 * Price per sq m of each stall type, in INR (domestic) and USD (international).
 * Leaving a box empty and saving removes that rate — the website then shows "N/A".
 */
export default function StallRatesPanel({ eventId, stallTypes }: { eventId: string; stallTypes: ChoiceOption[] }) {
  const [rates, setRates] = useState<StallRate[]>([]);
  const [edits, setEdits] = useState<Edits>({});
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Rows: every stall type in the dropdown list, plus any type that still has a rate but left the list.
  const types = useMemo(
    () => [...new Set([...stallTypes.map((t) => t.value), ...rates.map((r) => r.stallType)])],
    [stallTypes, rates]
  );
  const labelOf = (type: string) => stallTypes.find((t) => t.value === type)?.label ?? type;

  useEffect(() => {
    let cancelled = false;
    expoApi
      .rates(eventId)
      .then((data) => !cancelled && setRates(data))
      .catch((err) => !cancelled && setError(errorText(err, "Could not load stall rates.")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const saved = (type: string, currency: Currency) =>
    rates.find((r) => r.stallType === type && r.currency === currency);
  const savedText = (type: string, currency: Currency) => String(saved(type, currency)?.ratePerSqm ?? "");
  const draft = (type: string, currency: Currency) => edits[type]?.[currency] ?? savedText(type, currency);

  const isDirty = (type: string) => CURRENCIES.some((c) => draft(type, c) !== savedText(type, c));

  const saveRow = async (type: string) => {
    setSavingType(type);
    setError("");
    try {
      let next = [...rates];
      for (const currency of CURRENCIES) {
        const typed = draft(type, currency).trim();
        const existing = saved(type, currency);
        if (typed === savedText(type, currency)) continue;

        if (typed === "") {
          if (existing) {
            await expoApi.deleteRate(existing._id);
            next = next.filter((r) => r._id !== existing._id);
          }
          continue;
        }
        const amount = Number(typed);
        if (!Number.isFinite(amount) || amount < 0) throw new Error(`${currency} rate must be a positive number.`);
        const rate = await expoApi.saveRate(eventId, type, currency, amount);
        next = [...next.filter((r) => r._id !== rate._id), rate];
      }
      setRates(next);
      setEdits((d) => {
        const next = { ...d };
        delete next[type];
        return next;
      });
      setNotice(`${labelOf(type)} rates saved.`);
      setTimeout(() => setNotice(""), 2500);
    } catch (err) {
      setError(err instanceof Error && !("status" in err) ? err.message : errorText(err, "Could not save the rates."));
    } finally {
      setSavingType(null);
    }
  };

  return (
    <div className="rounded-lg border border-surface-border bg-surface-card shadow-sm">
      <div className="border-b border-surface-border px-4 py-2.5">
        <h2 className="text-sm font-semibold text-text-primary">Stall rates</h2>
        <p className="mt-0.5 text-xs text-text-secondary">
          Price per sq m by stall type. INR is charged to domestic exhibitors, USD to international ones. Stall types come
          from the “Stall Type” list in Dropdown Lists.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-4 py-2 font-medium">Stall type</th>
              <th className="px-4 py-2 font-medium">INR / sq m</th>
              <th className="px-4 py-2 font-medium">USD / sq m</th>
              <th className="px-4 py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-5 text-center text-text-secondary">
                  Loading…
                </td>
              </tr>
            ) : types.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-5 text-center text-text-secondary">
                  No stall types. Add them to the “Stall Type” list in Dropdown Lists.
                </td>
              </tr>
            ) : (
              types.map((type) => (
                <tr key={type} className="border-b border-surface-border last:border-0">
                  <td className="px-4 py-1.5 font-medium text-text-primary">
                    {labelOf(type)}
                    {!stallTypes.some((t) => t.value === type) && (
                      <span className="ml-2 text-[11px] font-normal text-amber-700">(no longer in the Stall Type list)</span>
                    )}
                  </td>
                  {CURRENCIES.map((currency) => (
                    <td key={currency} className="px-4 py-1.5">
                      <div className="relative max-w-[170px]">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                          {currency === "INR" ? "₹" : "$"}
                        </span>
                        <input
                          type="number"
                          min={0}
                          className={`${inputClass} pl-6`}
                          placeholder="Not set"
                          value={draft(type, currency)}
                          onChange={(e) =>
                            setEdits((d) => ({ ...d, [type]: { ...d[type], [currency]: e.target.value } }))
                          }
                        />
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-1.5 text-right">
                    <Button size="sm" disabled={!isDirty(type)} loading={savingType === type} onClick={() => saveRow(type)}>
                      <Save className="h-3.5 w-3.5" /> Save
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {(error || notice) && (
        <p className={`px-4 pb-2.5 text-sm ${error ? "text-red-600" : "text-green-700"}`}>{error || notice}</p>
      )}
    </div>
  );
}
