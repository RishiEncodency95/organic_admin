"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, Language, supportedLanguages } from "@/locales";

const STORAGE_KEY = "moksha-admin-language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: (typeof dictionaries)[Language];
  supportedLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "hi") setLanguageState(saved);
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  };

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const value = useMemo(() => ({ language, setLanguage, translations: dictionaries[language], supportedLanguages }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
