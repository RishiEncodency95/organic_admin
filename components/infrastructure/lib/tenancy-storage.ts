/** Single-organisation deployment: the "company" is a constant (it only keys the query cache). */
export const SINGLE_ORG_ID = "org";
export function getStoredCompanyId(): string | null {
  return SINGLE_ORG_ID;
}
