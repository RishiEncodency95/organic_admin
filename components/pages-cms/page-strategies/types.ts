import type { Dispatch, SetStateAction } from "react";
import type { CmsRecord } from "@/lib/cmsJson";

export type SectionsDraft = Array<CmsRecord>;
export type SetSectionsDraft = Dispatch<SetStateAction<SectionsDraft>>;
