"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ApiError } from "./errors";

const MAX_RETRIES = 2;

/** Same cache rules as the original: client errors (403, 404...) are not retried, they are shown. */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (ApiError.isApiError(error) && error.status >= 400 && error.status < 500) return false;
          return failureCount < MAX_RETRIES;
        },
      },
      mutations: { retry: false },
    },
  });
}

/** Scoped to the Infrastructure routes: the rest of the admin keeps its own data layer. */
export function InfraProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!bg-white !border-[#ece9e6] !text-[#1e2a38] !shadow-md !rounded-[6px] !text-[0.8125rem]",
            description: "!text-[#667585]",
          },
        }}
      />
    </QueryClientProvider>
  );
}
