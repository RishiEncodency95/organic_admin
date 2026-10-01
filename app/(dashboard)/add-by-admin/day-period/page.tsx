import { redirect } from "next/navigation";

// Managed as a tab of the Dropdown Manager now; kept so old links and bookmarks still work.
export default function DayPeriodPage() {
  redirect("/add-by-admin/dropdowns?tab=periods");
}
