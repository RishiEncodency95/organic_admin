"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";

const AUTH_STORAGE_KEY = "ms_admin_auth";

// Check synchronously if valid saved admin session exists
const checkHasSavedAuth = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.accessToken && parsed?.admin) {
        return true;
      }
    }
  } catch {}
  return false;
};

/**
 * Gate for the dashboard shell.
 * Loads instantly with ZERO preloader or artificial delay.
 * Route protection is enforced at server-edge via middleware.ts.
 */
export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin, hydrated } = useAppSelector((state) => state.auth);

  const [hasAuth, setHasAuth] = useState<boolean>(() => checkHasSavedAuth());

  useEffect(() => {
    const hasLocal = checkHasSavedAuth();

    if (hydrated) {
      if (!admin && !hasLocal) {
        if (typeof document !== "undefined") {
          document.cookie = "ms_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        }
        setHasAuth(false);
        router.replace("/login");
        return;
      }
      setHasAuth(true);
    } else if (hasLocal) {
      setHasAuth(true);
    }

    // Verify session silently in background without blocking UI
    if (hasLocal || admin) {
      authApi
        .getMe()
        .then((me) => {
          if (me.twoFactorPending) {
            router.replace("/login");
          }
        })
        .catch(() => {
          dispatch(logout());
          if (typeof window !== "undefined") {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            document.cookie = "ms_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          }
          setHasAuth(false);
          router.replace("/login");
        });
    }
  }, [hydrated, admin, router, dispatch]);

  // If genuinely not authenticated, render null while redirecting (no slow preloader)
  if (!hasAuth && hydrated && !admin) {
    return null;
  }

  return <>{children}</>;
}
