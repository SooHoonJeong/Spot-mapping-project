"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Locale } from "./translations";

const STORAGE_KEY = "spot-locale";

type TranslationParams = Record<string, string | number>;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: TranslationParams) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolve(path: string, locale: Locale): unknown {
  const segments = path.split(".");
  let node: unknown = translations[locale];
  for (const segment of segments) {
    if (node == null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return node;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ko" || stored === "en") {
      // Deliberately deferred to an effect (not a lazy useState initializer): the server has no
      // localStorage, so the first client render must also start from "ko" to match the SSR
      // output, then sync to the stored preference after mount. This is the standard
      // hydration-safe pattern (same approach next-themes uses).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const t = (path: string, params?: TranslationParams) => {
    const value = resolve(path, locale);
    if (typeof value !== "string") return path;
    return interpolate(value, params);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return ctx;
}
