import { LayoutGrid } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function CareerDashboardPage() {
  return (
    <ComingSoon
      icon={LayoutGrid}
      title="Career Dashboard"
      description="An overview of job postings, applications and hiring performance will live here."
    />
  );
}
