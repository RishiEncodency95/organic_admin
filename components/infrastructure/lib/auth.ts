import { useAppSelector } from "@/store/hooks";

/** Minimal stand-in for the original auth provider: only "is somebody signed in". */
export function useAuth() {
  const admin = useAppSelector((state) => state.auth.admin);
  return { user: admin ? { id: String((admin as { id?: string }).id ?? ""), name: (admin as { name?: string }).name ?? "" } : null };
}
