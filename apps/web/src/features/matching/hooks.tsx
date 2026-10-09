"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { MatchesResponse, ProfileFacts } from "@/lib/api/contracts";
function useMatchingState() {
  const [key, setKey] = useState("");
  const [matches, setMatches] = useState<MatchesResponse | null>(null);
  const rematch = useCallback(
    async (sessionId: string, facts: ProfileFacts) => {
      const response = await api.matches(sessionId, facts);
      setMatches(response);
      setKey(JSON.stringify({ sessionId, facts }));
      return response;
    },
    [],
  );
  function reset() {
    setMatches(null);
    setKey("");
  }
  return { key, matches, rematch, reset };
}
const Context = createContext<ReturnType<typeof useMatchingState> | null>(null);
export function MatchingProvider({ children }: { children: ReactNode }) {
  const value = useMatchingState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMatching() {
  const value = useContext(Context);
  if (!value) throw new Error("Matching provider is missing");
  return value;
}
