"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { authApi } from "@/lib/authApi";

const AUTH_STORAGE_KEY = "ms_admin_auth";

// Check synchronously if localStorage already has a saved admin session
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
 * Uses optimistic auth from localStorage so dashboard loads instantly without any white screen spinner flash.
 * Session validity is verified silently in the background.
 */
export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { admin, hydrated } = useAppSelector((state) => state.auth);

  // Synchronous optimistic auth check so the UI loads instantly without white spinner flash
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return checkHasSavedAuth();
  });

  useEffect(() => {
    const hasLocalAuth = checkHasSavedAuth();

    if (hydrated) {
      if (!admin && !hasLocalAuth) {
        router.replace("/login");
        return;
      }
      setIsAuthenticated(true);
    } else if (hasLocalAuth) {
      setIsAuthenticated(true);
    }

    // Verify session in the background silently without blocking the UI
    if (hasLocalAuth || admin) {
      authApi
        .getMe()
        .then((me) => {
          if (me.twoFactorPending) {
            router.replace("/login");
          }
        })
        .catch(() => {
          // If token expired or invalid, redirect to login
          router.replace("/login");
        });
    }
  }, [hydrated, admin, router]);

  // If user is genuinely not logged in, render null while redirecting to /login
  if (!isAuthenticated && hydrated && !admin) {
    return null;
  }

  return <>{children}</>;
}
