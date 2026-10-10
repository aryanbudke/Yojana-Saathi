"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { isLocale, LOCALE_NAMES, LOCALES, localeCookie } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Saves the choice in a cookie, then refreshes server-rendered content in place.
 * Client state (the profile being edited) survives because the page does not reload.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, messages } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={cn(
        "language-switcher relative inline-flex items-center gap-1.5 rounded-full bg-cream/90 text-[#022c2b] border border-[#022c2b]/10 shadow-2xs focus-within:ring-2 focus-within:ring-[#035352]",
        pending && "opacity-70",
        className,
      )}
    >
      <Globe2
        size={15}
        className="absolute left-3 text-[#035352] pointer-events-none"
        aria-hidden="true"
      />
      <span className="sr-only">{messages.language.label}</span>
      <select
        className="appearance-none bg-transparent min-h-[44px] pl-8 pr-4 text-sm font-semibold cursor-pointer rounded-full focus:outline-none"
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
    </label>
  );
}
