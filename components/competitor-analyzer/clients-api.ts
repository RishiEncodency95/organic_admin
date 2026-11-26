import { apiClient } from '@/components/infrastructure/lib/client';
export interface AnalyzerClient { id: string; name: string; website: string; displayName?: string | null }
export const clientsApi = {
  list: (_companyId: string) => apiClient.request<AnalyzerClient[]>({method:'GET',path:'/competitor-analyzer/clients'}),
  create: (body: {name:string;website:string}) => apiClient.request<AnalyzerClient>({method:'POST',path:'/competitor-analyzer/clients',body}),
};
