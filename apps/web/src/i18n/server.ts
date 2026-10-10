import { cookies, headers } from "next/headers";
import {
  isLocale,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  type Locale,
} from "./config";
import { messages } from "./messages";

/** The saved choice wins; otherwise fall back to the browser's preferred language. */
export async function getLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
}

export async function getMessages() {
  return messages[await getLocale()];
}
