"use client";

import CareerOptionManager from "@/components/add-by-admin/CareerOptionManager";

const TYPES = [{ value: "expected_ctc" as const, label: "Expected CTC (Annual)" }];

export default function ExpectedCtcPage() {
  return (
    <CareerOptionManager
      title="Expected CTC (Annual)"
      description="Salary ranges candidates can pick as their expected annual CTC on the application form."
      types={TYPES}
      valueLabel="Expected CTC"
      valuePlaceholder="e.g. ₹6 - 8 LPA"
    />
  );
}
