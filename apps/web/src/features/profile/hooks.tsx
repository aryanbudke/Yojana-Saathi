"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { api, ApiError } from "@/lib/api";
import {
  blankFacts,
  profileSchema,
  type ProfileSession,
  type ProfileField,
  type ProfileFacts,
} from "@/lib/api/contracts";
import { mergeExtraction } from "./model";
import type { ProfileDraft } from "./types";
function useProfileState() {
  const [draft, setDraft] = useState<ProfileDraft>({
    facts: { ...blankFacts },
    origins: {},
  });
  const [text, setText] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [session, setSession] = useState<ProfileSession | null>(null);
  const revision = useRef(0);
  async function extract() {
    const current = revision.current;
    const response = await api.extract(text);
    if (revision.current !== current) return;
    setDraft((prev) => mergeExtraction(prev, response.facts));
    setReviewing(true);
    setConfirmed(false);
  }
  function edit(field: ProfileField, value: ProfileFacts[ProfileField]) {
    setDraft((prev) => ({
      facts: { ...prev.facts, [field]: value },
      origins: { ...prev.origins, [field]: "user" },
    }));
    setConfirmed(false);
  }
  async function confirm() {
    const facts = profileSchema.parse(draft.facts);
    const active =
      session && Date.parse(session.expires_at) > Date.now()
        ? session
        : await api.createSession();
    setSession(active);
    // Save reviewed facts using the existing one-field endpoint; model values are now citizen-confirmed.
    for (const field of Object.keys(facts) as ProfileField[])
      await api.answer(active.session_id, field, facts[field]);
    setDraft({
      facts,
      origins: Object.fromEntries(Object.keys(facts).map((k) => [k, "user"])),
    });
    setConfirmed(true);
    return active;
  }
  async function clear() {
    if (session) {
      try {
        await api.deleteSession(session.session_id);
      } catch (e) {
        if (!(e instanceof ApiError) || e.status !== 404) throw e;
      }
    }
    revision.current++;
    setText("");
    setDraft({ facts: { ...blankFacts }, origins: {} });
    setSession(null);
    setReviewing(false);
    setConfirmed(false);
  }
  async function applyAnswer(
    field: ProfileField,
    value: ProfileFacts[ProfileField],
  ) {
    if (!session) throw new Error("Start a session first");
    profileSchema.parse({ ...draft.facts, [field]: value });
    const response = await api.answer(session.session_id, field, value);
    setDraft((prev) => ({
      facts: response.facts,
      origins: { ...prev.origins, [field]: "user" },
    }));
    return response.facts;
  }
  return {
    draft,
    text,
    setText,
    reviewing,
    setReviewing,
    confirmed,
    session,
    extract,
    edit,
    confirm,
    clear,
    applyAnswer,
  };
}
const Context = createContext<ReturnType<typeof useProfileState> | null>(null);
export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfileState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useProfile() {
  const value = useContext(Context);
  if (!value) throw new Error("Profile provider is missing");
  return value;
}
