"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Briefcase, CalendarClock, IndianRupee, ListChecks, MapPin, Store } from "lucide-react";
import DropdownListsManager from "@/components/add-by-admin/DropdownListsManager";
import CustomCitiesManager from "@/components/add-by-admin/CustomCitiesManager";
import CareerOptionManager from "@/components/add-by-admin/CareerOptionManager";
import ExpoStallsManager from "@/components/add-by-admin/expo/ExpoStallsManager";

const PERIOD_TYPES = [
  { value: "notice_period" as const, label: "Notice Period" },
  { value: "joining_period" as const, label: "Joining Period" },
];
const CTC_TYPES = [{ value: "expected_ctc" as const, label: "Expected CTC (Annual)" }];

const TABS = [
  { key: "lists", label: "Dropdown Lists", icon: ListChecks },
  { key: "cities", label: "Cities", icon: MapPin },
  { key: "periods", label: "Notice & Joining Period", icon: CalendarClock },
  { key: "ctc", label: "Expected CTC", icon: IndianRupee },
  { key: "stalls", label: "Events & Stalls", icon: Store },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const isTab = (value: string | null): value is TabKey => TABS.some((t) => t.key === value);

// The open tab lives in the URL (?tab=periods) so a refresh or a shared link opens it again,
// and the old Day Period / Expected CTC pages can redirect straight to their tab.
function DropdownManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: TabKey = isTab(requested) ? requested : "lists";
  const setTab = (key: TabKey) => router.replace(key === "lists" ? pathname : `${pathname}?tab=${key}`, { scroll: false });

  return (
    <div className="space-y-2 p-3">
      {/* Title and tabs share one row to leave the screen to the content. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-surface-border bg-surface-card px-3 py-1.5 shadow-sm">
        <h1
          className="flex items-center gap-1.5 text-sm font-semibold text-text-primary"
          title="Every dropdown on the website in one place. Add, edit, reorder, hide or delete options."
        >
          <Briefcase className="h-4 w-4 text-accent" /> Dropdown Manager
        </h1>

        <div role="tablist" className="flex flex-wrap gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors ${
                tab === key
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "lists" && <DropdownListsManager />}
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
