"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import { queryFromSearch } from "../types";

export function useSchemeDiscovery() {
  const search = useSearchParams();
  const pathname = usePathname();
  const query = search.toString();

  const load = useCallback(
    () => api.schemes(queryFromSearch(query)),
    [query],
  );

  const resource = useResource(load);

  const updateFilters = useCallback(
    (next: URLSearchParams) => {
      next.delete("cursor");
      const url = `${pathname}${next.size ? "?" + next.toString() : ""}#browse`;
      window.history.pushState(null, "", url);
    },
    [pathname],
  );

  const setCategory = useCallback(
    (category: string | null) => {
      const next = new URLSearchParams(query);
      if (!category || next.get("category") === category) {
        next.delete("category");
      } else {
        next.set("category", category);
      }
      updateFilters(next);
    },
    [query, updateFilters],
  );

  const setSearch = useCallback(
    (q: string, state_code: string) => {
      const next = new URLSearchParams(query);
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");

      if (state_code) next.set("state_code", state_code);
      else next.delete("state_code");

      updateFilters(next);
    },
    [query, updateFilters],
  );

  const clearFilters = useCallback(() => {
    updateFilters(new URLSearchParams());
  }, [updateFilters]);

  return {
    ...resource,
    searchParams: search,
    query,
    setCategory,
    setSearch,
    clearFilters,
  };
}
