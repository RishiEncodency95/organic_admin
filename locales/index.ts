import { en } from "./en";
import { hi } from "./hi";
import { Language } from "./types";

export const dictionaries = { en, hi } as const;
export const supportedLanguages: Language[] = ["en", "hi"];
export type { Language, TranslationDictionary } from "./types";
