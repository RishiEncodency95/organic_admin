"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarClock, IndianRupee, MapPin, Store } from "lucide-react";
import DropdownListsManager from "@/components/add-by-admin/DropdownListsManager";
import CustomCitiesManager from "@/components/add-by-admin/CustomCitiesManager";
import CareerOptionManager from "@/components/add-by-admin/CareerOptionManager";
import ExpoStallsManager from "@/components/add-by-admin/expo/ExpoStallsManager";

const PERIOD_TYPES = [
  { value: "notice_period" as const, label: "Notice Period" },
  { value: "joining_period" as const, label: "Joining Period" },
];
const CTC_TYPES = [{ value: "expected_ctc" as const, label: "Expected CTC (Annual)" }];

/** Managers with their own screens, opened from the dashboard's "More Managers" tiles */
// `page` puts each one in the table under the website page whose form uses it
const MANAGERS = [
  {
    key: "cities",
    label: "Cities",
    description: "Custom cities by state",
    icon: MapPin,
    page: "Shared",
    usedIn: ["Visitor Registration", "Buyer Registration", "Book a Stand", "Careers"],
  },
  {
    key: "periods",
    label: "Notice & Joining Period",
    description: "Careers application form",
    icon: CalendarClock,
    page: "Careers",
    usedIn: ["Careers application form"],
  },
  { key: "ctc", label: "Expected CTC", description: "Annual salary ranges", icon: IndianRupee, page: "Careers", usedIn: ["Careers application form"] },
  { key: "stalls", label: "Events & Stalls", description: "Expo events and stall setup", icon: Store, page: "Book a Stand", usedIn: ["Book a Stand"] },
] as const;

type TabKey = "lists" | (typeof MANAGERS)[number]["key"];

const isTab = (value: string | null): value is TabKey => value === "lists" || MANAGERS.some((m) => m.key === value);

// The open tab lives in the URL (?tab=periods) so a refresh or a shared link opens it again,
// and the old Day Period / Expected CTC pages can redirect straight to their tab.
function DropdownManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: TabKey = isTab(requested) ? requested : "lists";
  const setTab = (key: TabKey) => router.replace(key === "lists" ? pathname : `${pathname}?tab=${key}`, { scroll: false });

  const back = (
    <button
      type="button"
      onClick={() => setTab("lists")}
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-sunken hover:text-accent"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> All dropdowns
    </button>
  );

  // No page header: the dashboard opens straight away, and the other managers open from its
  // "More Managers" tiles (with a link back).
  return (
    <div className="min-h-[calc(100vh-100px)] w-full space-y-2 bg-white px-[18px] pb-[16px] pt-[14px]">
      {tab === "lists" && <DropdownListsManager managers={MANAGERS} onOpenManager={setTab} />}
      {tab !== "lists" && back}
      {tab === "cities" && <CustomCitiesManager />}
      {tab === "periods" && (
        <CareerOptionManager
          embedded
          title="Notice & Joining Period"
          description="Notice Period is shown to currently employed candidates; Joining Period to candidates who are not employed or are freshers."
          types={PERIOD_TYPES}
          valueLabel="Day"
          valuePlaceholder="e.g. 30 Days or Immediate"
        />
      )}
      {tab === "stalls" && <ExpoStallsManager />}
      {tab === "ctc" && (
        <CareerOptionManager
          embedded
          title="Expected CTC (Annual)"
          description="Salary ranges candidates can pick as their expected annual CTC on the application form."
          types={CTC_TYPES}
          valueLabel="Expected CTC"
          valuePlaceholder="e.g. ₹6 - 8 LPA"
        />
      )}
    </div>
  );
}

export default function DropdownManagerPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-secondary">Loading…</div>}>
      <DropdownManager />
    </Suspense>
  );
}
