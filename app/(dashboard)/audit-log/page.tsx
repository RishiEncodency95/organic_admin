import { redirect } from "next/navigation";

// The old Audit Log had no backend; every admin action is now recorded in the Activity Log.
export default function AuditLogPage() {
  redirect("/activity-log");
}
