"use client";

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './analyzer.css';

export function AnalyzerRoot({ children, shared = false }: { children: ReactNode; shared?: boolean }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false }, mutations: { retry: false } } }));
  return <QueryClientProvider client={client}><div className={`analyzer-root min-h-full bg-[#F7F9FC] ${shared ? 'analyzer-shared' : 'p-4 md:p-6'}`}>{children}</div><Toaster position="bottom-right" /></QueryClientProvider>;
}
