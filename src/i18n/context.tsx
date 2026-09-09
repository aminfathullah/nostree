import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { SupportedLocale, TranslationSchema } from "./types";
import { en } from "./locales/en";
import { id } from "./locales/id";

const dictionaries: Record<SupportedLocale, TranslationSchema> = {
  en,
  id,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationSchema>;

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "nostree_locale";

function getInitialLocale(): SupportedLocale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") {
      return saved;
    }
    const browserLang = navigator.language?.toLowerCase() || "";
    if (browserLang.startsWith("id")) {
      return "id";
    }
  } catch {}
  return "en";
}

function resolvePath(obj: any, path: string): string | undefined {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(getInitialLocale);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {}
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "id" : "en");
  }, [locale, setLocale]);

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {}
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const currentDict = dictionaries[locale] || dictionaries.en;
      let text = resolvePath(currentDict, key);

      if (typeof text !== "string") {
        text = resolvePath(dictionaries.en, key);
      }

      if (typeof text !== "string") {
        return key;
      }

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = (text as string).replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
        });
      }

      return text;
    },
    [locale]
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, setLocale, toggleLocale, t]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
