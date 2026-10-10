"use client";

import { useSyncExternalStore, useCallback } from "react";
import { schemeSchema, type SchemeSummary } from "@/lib/api/contracts";
import type { SavedSchemeItem } from "../types";

const EMPTY_SAVED: SavedSchemeItem[] = [];
const getServerSnapshot = () => EMPTY_SAVED;

const STORAGE_KEY = "yojana_saathi_saved_schemes";

function getSnapshot(): SavedSchemeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return EMPTY_SAVED;
    return parsed.filter(
      (item): item is SavedSchemeItem =>
        schemeSchema.safeParse(item).success &&
        typeof item.savedAt === "string" &&
        Number.isFinite(Date.parse(item.savedAt)),
    );
  } catch {
    return [];
  }
}

let cachedSnapshot = getSnapshot();

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    cachedSnapshot = getSnapshot();
    callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function notify() {
  cachedSnapshot = getSnapshot();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
}

export function useSavedSchemes() {
  const saved = useSyncExternalStore(
    subscribe,
    () => cachedSnapshot,
    getServerSnapshot,
  );

  const saveScheme = useCallback((scheme: SchemeSummary) => {
    const current = getSnapshot();
    if (current.some((s) => s.id === scheme.id)) return true;
    const updated: SavedSchemeItem[] = [
      ...current,
      { ...scheme, savedAt: new Date().toISOString() },
    ];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notify();
      return true;
    } catch {
      return false;
    }
  }, []);

  const removeScheme = useCallback((schemeId: string) => {
    const current = getSnapshot();
    const updated = current.filter((s) => s.id !== schemeId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notify();
      return true;
    } catch {
      return false;
    }
  }, []);

  const isSaved = useCallback(
    (schemeId: string) => saved.some((s) => s.id === schemeId),
    [saved],
  );

  return {
    saved,
    loaded: true,
    saveScheme,
    removeScheme,
    isSaved,
  };
}
