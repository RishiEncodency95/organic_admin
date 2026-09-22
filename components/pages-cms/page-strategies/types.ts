import type { Dispatch, SetStateAction } from "react";

export type SectionsDraft = Array<Record<string, any>>;
export type SetSectionsDraft = Dispatch<SetStateAction<SectionsDraft>>;
