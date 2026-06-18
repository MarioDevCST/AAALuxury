"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultLanguage,
  isLanguage,
  messages,
  type Language,
} from "@/lib/i18n";

const storageKey = "siteLanguage";

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof messages.es;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw && isLanguage(raw)) {
        queueMicrotask(() => setLangState(raw));
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(storageKey, lang);
    } catch {}
  }, [lang]);

  const setLang = useCallback((next: Language) => setLangState(next), []);

  const value = useMemo<LanguageContextValue>(() => {
    return { lang, setLang, t: messages[lang] };
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
