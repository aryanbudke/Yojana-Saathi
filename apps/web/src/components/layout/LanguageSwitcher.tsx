"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe2 } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { isLocale, LOCALE_NAMES, LOCALES, localeCookie } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Saves the choice in a cookie, then refreshes server-rendered content in place.
 * Client state (the profile being edited) survives because the page does not reload.
 * Styles live in navbar.css (`.language-switcher`).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, messages } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={cn("language-switcher", className)}
      data-pending={pending || undefined}
    >
      <Globe2 size={15} className="language-switcher-globe" aria-hidden="true" />
      <span className="sr-only">{messages.language.label}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          if (!isLocale(next)) return;
          document.cookie = localeCookie(next);
          startTransition(() => router.refresh());
        }}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} lang={code}>
            {LOCALE_NAMES[code]}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="language-switcher-chevron" aria-hidden="true" />
    </label>
  );
}
