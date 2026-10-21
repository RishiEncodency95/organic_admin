/**
 * The original platform scopes every request to a Company. Bharat Organic Expo is a single organisation, so there is
 * nothing to select: the scope is a fixed placeholder and no scope header is sent.
 */
export function companyScopeHeaders(_companyId?: string | null, extra: Record<string, string> = {}): Record<string, string> {
  return { ...extra };
}
