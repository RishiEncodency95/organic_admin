"use client";
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/components/infrastructure/lib/client';
import { useAuth } from '@/components/infrastructure/lib/auth';
export function useCanManage() {
  const {user}=useAuth();
  const query=useQuery({queryKey:['analyzer-capabilities',user?.id],enabled:Boolean(user),queryFn:()=>apiClient.request<{read:boolean;manage:boolean}>({method:'GET',path:'/competitor-analyzer/capabilities'}),staleTime:60_000});
  return query.data?.manage === true;
}
export function Manage({children}:{children:ReactNode}) { return useCanManage() ? <>{children}</> : null; }
