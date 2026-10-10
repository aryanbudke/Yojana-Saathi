"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { SchemeSummary } from "@/lib/api/contracts";
import type { SavedSchemeItem } from "../types";

const STORAGE_KEY = "yojana_saathi_saved_schemes";

function getSnapshot(): SavedSchemeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
  const saved = useSyncExternalStore(subscribe, () => cachedSnapshot, () => []);

  const saveScheme = useCallback((scheme: SchemeSummary) => {
    const current = getSnapshot();
    if (current.some((s) => s.id === scheme.id)) return;
    const updated: SavedSchemeItem[] = [
      ...current,
      { ...scheme, savedAt: new Date().toISOString() },
    ];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notify();
    } catch {}
  }, []);

  const removeScheme = useCallback((schemeId: string) => {
    const current = getSnapshot();
    const updated = current.filter((s) => s.id !== schemeId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notify();
    } catch {}
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
