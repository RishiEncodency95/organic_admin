"use client";

import CareerOptionManager from "@/components/add-by-admin/CareerOptionManager";

const TYPES = [
  { value: "notice_period" as const, label: "Notice Period" },
  { value: "joining_period" as const, label: "Joining Period" },
];

export default function DayPeriodPage() {
  return (
    <CareerOptionManager
      title="Day Period"
      description="Notice Period is shown to currently employed candidates; Joining Period to candidates who are not employed or are freshers."
      types={TYPES}
      valueLabel="Day"
      valuePlaceholder="e.g. 30 Days or Immediate"
    />
  );
}
