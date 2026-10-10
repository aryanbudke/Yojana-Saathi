"use client";
import { useEffect, useState } from "react";
import { useMessages } from "@/i18n/client";
import { errorMessage } from "./client";
export function useResource<T>(load: () => Promise<T>) {
  const m = useMessages();
  // Keep the raw failure and word it at render time, so it follows a language switch.
  const [state, setState] = useState<{
    data: T | null;
    failure: unknown;
    loading: boolean;
  }>({ data: null, failure: null, loading: true });
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setState((prev) => ({ ...prev, failure: null, loading: true }));
      try {
        const data = await load();
        if (active) setState({ data, failure: null, loading: false });
      } catch (e) {
        if (active)
          setState((prev) => ({ ...prev, failure: e ?? true, loading: false }));
      }
    });
    return () => {
      active = false;
    };
  }, [load, retryKey]);
  return {
    data: state.data,
    loading: state.loading,
    error: state.failure === null ? "" : errorMessage(state.failure, m.errors),
    retry: () => setRetryKey((k) => k + 1),
  };
}
