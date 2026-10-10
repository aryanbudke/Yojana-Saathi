"use client";

import { Mic, Volume2, VolumeX } from "lucide-react";
import { Button, InlineAlert } from "@/components/ui";
import { useSpeech } from "./SpeechProvider";

export const speechLanguages = [
  { code: "en-IN" as const, label: "English" },
  { code: "hi-IN" as const, label: "हिन्दी" },
  { code: "kn-IN" as const, label: "ಕನ್ನಡ" },
];

export function SpeechInputControls({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const speech = useSpeech();
  return (
    <div className="speech-controls">
      <label className="speech-language">
        <span>Voice language</span>
        <select
          className="input"
          value={speech.language}
          onChange={(event) =>
            speech.setLanguage(event.target.value as typeof speech.language)
          }
          disabled={speech.recording || speech.working}
        >
          {speechLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.label}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        variant={speech.recording ? "secondary" : "quiet"}
        busy={speech.working}
        disabled={speech.working || speech.recording}
        onClick={() => void speech.startRecording(onTranscript)}
        aria-pressed={speech.recording}
      >
        <Mic size={16} />
        {speech.recording
          ? "Listening…"
          : speech.working
            ? "Transcribing…"
            : "Speak instead"}
      </Button>
      <span className="small muted" aria-live="polite">
        {speech.recording
          ? "Listening… recording stops automatically when you finish speaking."
          : "Your recording is sent to Sarvam AI and is not saved by Yojana Saathi."}
      </span>
      {speech.error && <InlineAlert error>{speech.error}</InlineAlert>}
    </div>
  );
}

export function ReadAloudButton({ text }: { text: string }) {
  const speech = useSpeech();
  return (
    <div className="read-aloud">
      <label className="speech-language compact">
        <span>Audio language</span>
        <select
          className="input"
          value={speech.language}
          onChange={(event) =>
            speech.setLanguage(event.target.value as typeof speech.language)
          }
          disabled={speech.working || speech.speaking}
        >
          {speechLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.label}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        variant="quiet"
        busy={speech.working && !speech.speaking}
        disabled={!text.trim() || (speech.working && !speech.speaking)}
        onClick={() =>
          speech.speaking ? speech.stopSpeaking() : void speech.speak(text)
        }
      >
        {speech.speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
        {speech.speaking ? "Stop audio" : "Read aloud"}
      </Button>
      {speech.language !== "en-IN" && (
        <span className="small muted">
          AI-translated audio; check the original text.
        </span>
      )}
      {speech.error && <InlineAlert error>{speech.error}</InlineAlert>}
    </div>
  );
}
