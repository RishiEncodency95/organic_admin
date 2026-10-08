import { redirect } from "next/navigation";

// The resume-only limit is now part of IP Block Limits (every protected website API)
export default function ResumeUploadLimitPage() {
  redirect("/ip-block-limits");
}
