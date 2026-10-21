/** This deployment has no Client entity (see docs: Infrastructure module). Kept so the original dialogs compile. */
export type ClientOption = { id: string; name: string; displayName?: string | null };
export const clientsApi = {
  list: async (_companyId: string): Promise<ClientOption[]> => [],
};
