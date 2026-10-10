"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { api, ApiError } from "@/lib/api";
import { useSpeech } from "@/features/speech/SpeechProvider";
import {
  blankFacts,
  profileSchema,
  type ProfileSession,
  type ProfileField,
  type ProfileFacts,
} from "@/lib/api/contracts";
import {
  fieldsToConfirm,
  mergeExtraction,
  getFieldStatus as computeFieldStatus,
  getExtractedFields,
} from "./model";
import type { ProfileDraft, FieldStatus } from "./types";
function useProfileState() {
  const { language } = useSpeech();
  const [draft, setDraft] = useState<ProfileDraft>({
    facts: { ...blankFacts },
    origins: {},
  });
  const [extractedSnapshot, setExtractedSnapshot] =
    useState<ProfileFacts | null>(null);
  const [confirmedFacts, setConfirmedFacts] = useState<ProfileFacts | null>(
    null,
  );
  const [text, setText] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [session, setSession] = useState<ProfileSession | null>(null);
  const revision = useRef(0);

  async function saveFacts(facts: ProfileFacts) {
    let active =
      session && Date.parse(session.expires_at) > Date.now()
        ? session
        : await api.createSession();
    setSession(active);
    try {
      for (const field of fieldsToConfirm(facts, active.facts)) {
        const response = await api.answer(
          active.session_id,
          field,
          facts[field],
        );
        active = { ...active, facts: response.facts };
        setSession(active);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setSession(null);
        setConfirmed(false);
        throw new ApiError(
          "SESSION_EXPIRED",
          "Your session expired. Your details are still here; confirm them to start a new session.",
          404,
        );
      }
      throw error;
    }
    return active;
  }

  async function extract() {
    const current = revision.current;
    const response = await api.extract(text, language);
    if (revision.current !== current) return;
    setExtractedSnapshot(response.facts);
    const extractedDraft = mergeExtraction(draft, response.facts);
    setDraft(extractedDraft);
    setReviewing(true);
    setConfirmed(false);
    setConfirmedFacts(null);
    await saveFacts(profileSchema.parse(extractedDraft.facts));
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
    const active = await saveFacts(facts);
    setDraft({
      facts,
      origins: Object.fromEntries(Object.keys(facts).map((k) => [k, "user"])),
    });
    setConfirmed(true);
    setConfirmedFacts(facts);
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
    setExtractedSnapshot(null);
    setConfirmedFacts(null);
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
    setSession({ ...session, facts: response.facts });
    setDraft((prev) => ({
      facts: response.facts,
      origins: { ...prev.origins, [field]: "user" },
    }));
    if (confirmed) {
      setConfirmedFacts(response.facts);
    }
    return response.facts;
  }

  const extractedFields = getExtractedFields(extractedSnapshot, draft);
  const extractedCount = extractedFields.length;

  function getFieldStatus(field: ProfileField): FieldStatus {
    return computeFieldStatus(field, draft, extractedSnapshot, confirmed);
  }

  function isExtracted(field: ProfileField): boolean {
    return extractedFields.includes(field);
  }

  function isCorrected(field: ProfileField): boolean {
    return getFieldStatus(field) === "user_corrected";
  }

  function isUnknown(field: ProfileField): boolean {
    return draft.facts[field] === null;
  }

  return {
    draft,
    extractedSnapshot,
    confirmedFacts,
    extractedFields,
    extractedCount,
    getFieldStatus,
    isExtracted,
    isCorrected,
    isUnknown,
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
