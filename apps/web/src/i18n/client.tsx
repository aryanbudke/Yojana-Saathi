"use client";
import { createContext, useContext, type ReactNode } from "react";
import { INTL_LOCALES, type Locale } from "./config";
import { displayDate } from "@/lib/format";
import type { Messages } from "./messages/en";

type I18n = { locale: Locale; messages: Messages };
const I18nContext = createContext<I18n | null>(null);

/** Receives only the active locale's messages from the server layout. */
export function I18nProvider({
  locale,
  messages,
  children,
}: I18n & { children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

export function useMessages(): Messages {
  return useI18n().messages;
}

/** Dates in the reader's language, e.g. "20 सित॰ 2026". */
export function useDisplayDate(): (value: string) => string {
  const { locale, messages } = useI18n();
  return (value) =>
    displayDate(
      value,
      INTL_LOCALES[locale],
      messages.common.verificationDateUnavailable,
    );
}
