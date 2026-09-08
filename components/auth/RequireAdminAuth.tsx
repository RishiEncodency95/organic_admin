"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { authApi } from "@/lib/authApi";
import Spinner from "@/components/ui/Spinner";

/** Gate for the dashboard shell — redirects to /login if no admin session is present, OR if the
 * account still has mandatory 2FA enrollment pending (every permission-gated route 403s until
 * that's done — see auth.middleware.ts's authorize() — so the dashboard can't actually be used
 * yet; /login owns the enrollment UI, not this shell). */
export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { admin, hydrated } = useAppSelector((state) => state.auth);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!admin) {
      router.replace("/login");
      return;
    }
    authApi
      .getMe()
      .then((me) => {
        if (me.twoFactorPending) {
          router.replace("/login");
        } else {
          setChecked(true);
        }
      })
      .catch(() => router.replace("/login"));
  }, [hydrated, admin, router]);

  if (!hydrated || !admin || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-bg">
        <Spinner label="Checking session..." />
      </div>
    );
  }

  return <>{children}</>;
}
