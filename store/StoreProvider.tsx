"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore, AUTH_STORAGE_KEY } from "./store";
import { hydrate } from "./slices/authSlice";
import { setTokens } from "@/lib/api";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTokens({ accessToken: parsed.accessToken, refreshToken: parsed.refreshToken });
        storeRef.current?.dispatch(hydrate(parsed));
        return;
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    storeRef.current?.dispatch(hydrate(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
