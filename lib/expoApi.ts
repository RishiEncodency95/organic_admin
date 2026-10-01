import { api } from "./api";

export interface PaymentPlan {
  id: string;
  label: string;
  percentage: number;
}

export type StallStatus = "available" | "reserved" | "booked" | "blocked";
export const STALL_STATUSES: StallStatus[] = ["available", "reserved", "booked", "blocked"];

export interface ExpoEvent {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
  isActive: boolean;
  paymentPlans: PaymentPlan[];
  stallCounts?: Partial<Record<StallStatus, number>>;
}

export interface Stall {
  _id: string;
  event: string;
  stallNumber: string;
  hall: string;
  stallType: string;
  length: number;
  width: number;
  area: number;
  plScheme: string;
  incrementPercentage: number;
  discountPercentage: number;
  status: StallStatus;
  notes: string;
}

export interface StallRate {
  _id: string;
  event: string;
  stallType: string;
  currency: "INR" | "USD";
  ratePerSqm: number;
}

export interface ChoiceOption {
  label: string;
  value: string;
}

export type EventInput = Omit<ExpoEvent, "_id" | "stallCounts">;
export type StallInput = Omit<Stall, "_id" | "event" | "area">;

// api.get memoises GETs for a moment; the timestamp keeps lists fresh after a change.
const fresh = () => `_=${Date.now()}`;

export const expoApi = {
  events: () => api.get<ExpoEvent[]>(`/events/admin?${fresh()}`),
  createEvent: (data: EventInput) => api.post<ExpoEvent>("/events/admin", data),
  updateEvent: (id: string, data: Partial<EventInput>) => api.patch<ExpoEvent>(`/events/admin/${id}`, data),
  deleteEvent: (id: string) => api.delete<null>(`/events/admin/${id}`),

  stalls: (eventId: string) => api.get<Stall[]>(`/stalls/admin?eventId=${eventId}&${fresh()}`),
  createStall: (eventId: string, data: StallInput) => api.post<Stall>("/stalls/admin", { eventId, ...data }),
  createStallsBulk: (eventId: string, stalls: Partial<StallInput>[]) =>
    api.post<Stall[]>("/stalls/admin/bulk", { eventId, stalls }),
  updateStall: (id: string, data: Partial<StallInput>) => api.patch<Stall>(`/stalls/admin/${id}`, data),
  deleteStall: (id: string) => api.delete<null>(`/stalls/admin/${id}`),

  rates: (eventId: string) => api.get<StallRate[]>(`/stall-rates/admin?eventId=${eventId}&${fresh()}`),
  saveRate: (eventId: string, stallType: string, currency: "INR" | "USD", ratePerSqm: number) =>
    api.put<StallRate>("/stall-rates/admin", { eventId, stallType, currency, ratePerSqm }),
  deleteRate: (id: string) => api.delete<null>(`/stall-rates/admin/${id}`),

  /** Stall Type and Open Sides choices come from the Dropdown Manager lists. */
  stallChoices: () =>
    api
      .get<Record<string, ChoiceOption[]>>(`/dropdowns?lists=exhibitor-stall-type,stall-pl-scheme&${fresh()}`)
      .then((d) => ({ stallTypes: d["exhibitor-stall-type"] ?? [], plSchemes: d["stall-pl-scheme"] ?? [] })),
};

/* The expo runs in India, so event dates are entered and shown in IST. */
const IST_OFFSET_MS = 330 * 60 * 1000;

/** ISO timestamp -> "YYYY-MM-DD" as the IST calendar date. */
export const toIstDateInput = (iso: string) => new Date(new Date(iso).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/** "YYYY-MM-DD" -> start or end of that IST day, as sent to the API. */
export const fromIstDateInput = (date: string, edge: "start" | "end") =>
  `${date}T${edge === "start" ? "00:00:00" : "23:59:59"}+05:30`;
