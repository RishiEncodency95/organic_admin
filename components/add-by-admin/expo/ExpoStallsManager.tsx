"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CalendarDays, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  expoApi,
  fromIstDateInput,
  toIstDateInput,
  type ChoiceOption,
  type ExpoEvent,
  type PaymentPlan,
} from "@/lib/expoApi";
import StallRatesPanel from "./StallRatesPanel";
import StallsPanel from "./StallsPanel";
import { errorText, inputClass } from "./shared";


type EventForm = {
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
  isActive: boolean;
  paymentPlans: PaymentPlan[];
};

const EMPTY_EVENT: EventForm = {
  name: "",
  startDate: "",
  endDate: "",
  venue: "",
  city: "",
  isActive: true,
  paymentPlans: [{ id: "full", label: "Full Payment", percentage: 100 }],
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

/**
 * Book a Stand setup: the expo events, each event's stall rates and its stalls.
 * The website offers active events, the rates per stall type and every "available" stall.
 */
export default function ExpoStallsManager() {
  const [events, setEvents] = useState<ExpoEvent[]>([]);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [choices, setChoices] = useState<{ stallTypes: ChoiceOption[]; plSchemes: ChoiceOption[] }>({
    stallTypes: [],
    plSchemes: [],
  });
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExpoEvent | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_EVENT);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(
    () =>
      expoApi
        .events()
        .then((data) => {
          setEvents(data);
          setEventId((current) => (current && data.some((e) => e._id === current) ? current : data[0]?._id ?? ""));
        })
        .catch((err) => setError(errorText(err, "Could not load events.")))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    fetchEvents();
    expoApi.stallChoices().then(setChoices).catch(() => {});
  }, [fetchEvents]);

  const event = events.find((e) => e._id === eventId) ?? null;

  /* ---------- event form ---------- */

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_EVENT);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = () => {
    if (!event) return;
    setEditing(event);
    setForm({
      name: event.name,
      startDate: toIstDateInput(event.startDate),
      endDate: toIstDateInput(event.endDate),
      venue: event.venue,
      city: event.city,
      isActive: event.isActive,
      paymentPlans: event.paymentPlans.length ? event.paymentPlans : EMPTY_EVENT.paymentPlans,
    });
    setFormError("");
    setFormOpen(true);
  };

  const setPlan = (index: number, patch: Partial<PaymentPlan>) =>
    setForm((f) => ({ ...f, paymentPlans: f.paymentPlans.map((p, i) => (i === index ? { ...p, ...patch } : p)) }));

  const saveEvent = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.name.trim()) return setFormError("Event name is required.");
    if (!form.startDate || !form.endDate) return setFormError("Start and end dates are required.");
    if (form.endDate < form.startDate) return setFormError("End date cannot be before start date.");
    if (!form.paymentPlans.length) return setFormError("Add at least one payment plan.");

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        name: form.name.trim(),
        startDate: fromIstDateInput(form.startDate, "start"),
        endDate: fromIstDateInput(form.endDate, "end"),
        venue: form.venue.trim(),
        city: form.city.trim(),
        isActive: form.isActive,
        paymentPlans: form.paymentPlans.map((p) => ({ ...p, id: p.id.trim(), label: p.label.trim(), percentage: Number(p.percentage) })),
      };
      const saved = editing ? await expoApi.updateEvent(editing._id, payload) : await expoApi.createEvent(payload);
      await fetchEvents();
      setEventId(saved._id);
      setFormOpen(false);
    } catch (err) {
      setFormError(errorText(err, "Could not save the event."));
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async () => {
    if (!event) return;
    setDeleting(true);
    try {
      await expoApi.deleteEvent(event._id);
      setEventId("");
      await fetchEvents();
    } catch (err) {
      setError(errorText(err, "Could not delete the event."));
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  /* ---------- render ---------- */

  const counts = event?.stallCounts ?? {};
  const totalStalls = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

  return (
    <div className="space-y-3">
      {/* EVENT BAR */}
      <div className="rounded-lg border border-surface-border bg-surface-card p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[260px] flex-1">
            <span className="mb-1 block text-xs font-medium text-text-secondary">Expo event</span>
            <select className={inputClass} value={eventId} onChange={(e) => setEventId(e.target.value)} disabled={loading}>
              {events.length === 0 && <option value="">{loading ? "Loading…" : "No events yet"}</option>}
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                  {e.isActive ? "" : " (inactive)"}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New event
          </Button>
          {event && (
            <>
              <Button variant="secondary" onClick={openEdit}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>

        {event && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> {formatDate(event.startDate)} – {formatDate(event.endDate)}
            </span>
            {(event.venue || event.city) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {[event.venue, event.city].filter(Boolean).join(", ")}
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                event.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {event.isActive ? "Active – shown on Book a Stand" : "Inactive – hidden from website"}
            </span>
            <span className="text-xs">
              {totalStalls} stalls · {counts.available ?? 0} available · {counts.reserved ?? 0} reserved ·{" "}
              {counts.booked ?? 0} booked · {counts.blocked ?? 0} blocked
            </span>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {event ? (
        <>
          {/* Keyed by event so switching events starts each panel fresh. */}
          <StallRatesPanel key={`rates-${event._id}`} eventId={event._id} stallTypes={choices.stallTypes} />
          <StallsPanel
            key={`stalls-${event._id}`}
            eventId={event._id}
            stallTypes={choices.stallTypes}
            plSchemes={choices.plSchemes}
            onStallsChanged={fetchEvents}
          />
        </>
      ) : (
        !loading && (
          <div className="rounded-lg border border-dashed border-surface-border p-8 text-center text-sm text-text-secondary">
            Create an event first, then add its stall rates and stalls.
          </div>
        )
      )}

      {/* EVENT FORM */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.name}` : "New expo event"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={() => saveEvent()}>
              {editing ? "Save changes" : "Create event"}
            </Button>
          </>
        }
      >
        <form onSubmit={saveEvent} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">Event name *</span>
            <input
              className={inputClass}
              value={form.name}
              maxLength={150}
              placeholder="e.g. Bharat Organic Expo 2027"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-text-secondary">Start date *</span>
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-text-secondary">End date *</span>
              <input
                type="date"
                className={inputClass}
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-text-secondary">Venue</span>
              <input className={inputClass} value={form.venue} maxLength={200} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-text-secondary">City</span>
              <input className={inputClass} value={form.city} maxLength={80} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active — offer this event on the Book a Stand page
          </label>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Payment plans *</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    paymentPlans: [...f.paymentPlans, { id: `plan-${f.paymentPlans.length + 1}`, label: "Advance", percentage: 50 }],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add plan
              </Button>
            </div>
            <div className="space-y-2">
              {form.paymentPlans.map((plan, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.5fr_110px_32px] items-center gap-2">
                  <input className={inputClass} value={plan.id} placeholder="id (e.g. full)" onChange={(e) => setPlan(i, { id: e.target.value })} />
                  <input className={inputClass} value={plan.label} placeholder="Label" onChange={(e) => setPlan(i, { label: e.target.value })} />
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className={`${inputClass} pr-7`}
                      value={plan.percentage}
                      onChange={(e) => setPlan(i, { percentage: Number(e.target.value) })}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">%</span>
                  </div>
                  <button
                    type="button"
                    title="Remove plan"
                    disabled={form.paymentPlans.length === 1}
                    onClick={() => setForm((f) => ({ ...f, paymentPlans: f.paymentPlans.filter((_, j) => j !== i) }))}
                    className="rounded p-1.5 text-text-secondary hover:bg-surface-sunken disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-text-muted">A plan at 100% (id “full”) is the full-payment option; lower percentages are advance payments.</p>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete event"
        description={`"${event?.name ?? ""}" and its stall rates will be deleted. An event that still has stalls cannot be deleted — delete its stalls first, or mark the event inactive instead.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={deleteEvent}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
