"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ApiRequestError } from "@/lib/api";
import { locationsApi, type CustomCity, type LocationItem } from "@/lib/dropdownsApi";

const inputClass =
  "h-9 w-full rounded-md border border-surface-border bg-surface-card px-3 text-sm text-text-primary outline-none focus:border-accent";

const errorText = (err: unknown, fallback: string) => (err instanceof ApiRequestError ? err.message : fallback);

/**
 * Country / State / City dropdowns use built-in data. This adds the cities it lacks for
 * a state; they appear in that state's city list on every form, before "Other".
 */
export default function CustomCitiesManager() {
  const [countries, setCountries] = useState<LocationItem[]>([]);
  const [states, setStates] = useState<LocationItem[]>([]);
  const [countryCode, setCountryCode] = useState("IN");
  const [stateCode, setStateCode] = useState("");
  const [name, setName] = useState("");

  const [cities, setCities] = useState<CustomCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [editing, setEditing] = useState<CustomCity | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CustomCity | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchCities = useCallback(
    () =>
      locationsApi
        .customCities()
        .then(setCities)
        .catch((err) => setError(errorText(err, "Could not load cities.")))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    fetchCities();
    locationsApi.countries().then(setCountries).catch(() => {});
  }, [fetchCities]);

  useEffect(() => {
    let cancelled = false;
    locationsApi
      .states(countryCode)
      .then((data) => !cancelled && setStates(data))
      .catch(() => !cancelled && setStates([]));
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  const stateName = (code: string) => states.find((s) => s.stateCode === code)?.name ?? code;
  const countryName = (code: string) => countries.find((c) => c.countryCode === code)?.name ?? code;

  const visible = useMemo(
    () => cities.filter((c) => !stateFilter || c.stateCode === stateFilter),
    [cities, stateFilter]
  );

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const cancelEdit = () => {
    setEditing(null);
    setName("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cityName = name.trim();
    if (!cityName) return setError("City name is required.");
    if (!editing && !stateCode) return setError("Please choose a state.");

    setSaving(true);
    setError("");
    try {
      if (editing) {
        const updated = await locationsApi.updateCity(editing._id, { name: cityName });
        setCities((prev) => prev.map((c) => (c._id === editing._id ? updated : c)));
        flash("City updated.");
      } else {
        const created = await locationsApi.addCity(stateCode, cityName);
        setCities((prev) => [...prev, created]);
        flash(`${created.name} added — it now shows in the city dropdown for ${stateName(stateCode)}.`);
      }
      cancelEdit();
    } catch (err) {
      setError(errorText(err, "Could not save the city."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (city: CustomCity) => {
    setBusyId(city._id);
    try {
      const updated = await locationsApi.updateCity(city._id, { isActive: !city.isActive });
      setCities((prev) => prev.map((c) => (c._id === city._id ? updated : c)));
    } catch (err) {
      setError(errorText(err, "Could not change the status."));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await locationsApi.removeCity(pendingDelete._id);
      setCities((prev) => prev.filter((c) => c._id !== pendingDelete._id));
      if (editing?._id === pendingDelete._id) cancelEdit();
      setPendingDelete(null);
      flash("City deleted.");
    } catch (err) {
      setPendingDelete(null);
      setError(errorText(err, "Could not delete the city."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="rounded-lg border border-surface-border bg-surface-card p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">{editing ? `Rename ${editing.name}` : "Add a missing city"}</h2>
          {editing && (
            <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
              <X className="h-3.5 w-3.5" /> Cancel edit
            </Button>
          )}
        </div>
        <p className="mb-3 text-xs text-text-secondary">
          Countries, states and most cities are built in. Add a city here only if it is missing from a state&apos;s list.
          Every city list also ends with “Other”.
        </p>

        <div className={`grid gap-3 ${editing ? "md:grid-cols-1" : "md:grid-cols-3"}`}>
          {!editing && (
            <>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-text-secondary">Country *</span>
                <select
                  className={inputClass}
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setStateCode("");
                  }}
                >
                  {(countries.length ? countries : [{ _id: "IN", name: "India", countryCode: "IN" }]).map((c) => (
                    <option key={c.countryCode} value={c.countryCode}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-text-secondary">State *</span>
                <select className={inputClass} value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
                  <option value="">Select state…</option>
                  {states.map((s) => (
                    <option key={s.stateCode} value={s.stateCode}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">City name *</span>
            <input
              className={inputClass}
              value={name}
              maxLength={100}
              placeholder="e.g. Greater Noida West"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {notice && <p className="mt-3 text-sm text-green-700">{notice}</p>}
        <div className="mt-3 flex justify-end">
          <Button type="submit" loading={saving}>
            {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editing ? "Save name" : "Add city"}
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-surface-border bg-surface-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-4 py-3">
          <h3 className="text-sm font-semibold text-text-primary">Added cities ({cities.length})</h3>
          <select
            className={`${inputClass} w-auto min-w-[200px]`}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All states</option>
            {[...new Set(cities.map((c) => c.stateCode))].sort().map((code) => (
              <option key={code} value={code}>
                {stateName(code)}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-4 py-2.5 font-medium">City</th>
                <th className="px-4 py-2.5 font-medium">State</th>
                <th className="px-4 py-2.5 font-medium">Country</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    Loading…
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    No cities added yet.
                  </td>
                </tr>
              ) : (
                visible.map((city) => (
                  <tr key={city._id} className={`border-b border-surface-border last:border-0 ${city.isActive ? "" : "opacity-60"}`}>
                    <td className="px-4 py-2 font-medium text-text-primary">{city.name}</td>
                    <td className="px-4 py-2 text-text-secondary">{stateName(city.stateCode)}</td>
                    <td className="px-4 py-2 text-text-secondary">{countryName(city.countryCode)}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        disabled={busyId === city._id}
                        onClick={() => toggleActive(city)}
                        title="Click to show / hide on the website"
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          city.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {city.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditing(city);
                            setName(city.name);
                            setError("");
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setPendingDelete(city)}>
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete city"
        description={`"${pendingDelete?.name ?? ""}" will no longer appear in the city dropdown. Past submissions keep the name they were sent with.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
