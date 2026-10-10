"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, errorMessage } from "@/lib/api";
import type { SpeechLanguage } from "@/lib/api/client";

const RECORDING_LIMIT_MS = 28_000;
const NO_SPEECH_LIMIT_MS = 8_000;
const SILENCE_AFTER_SPEECH_MS = 1_200;
const SPEECH_LEVEL_THRESHOLD = 0.018;

function useSpeechState() {
  const [language, setLanguage] = useState<SpeechLanguage>("en-IN");
  const [recording, setRecording] = useState(false);
  const [working, setWorking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceFrame = useRef<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const heardSpeech = useRef(false);
  const receiveTranscript = useRef<(text: string) => void>(() => undefined);
  const player = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);

  const cleanupRecording = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (silenceFrame.current !== null) {
      cancelAnimationFrame(silenceFrame.current);
    }
    silenceFrame.current = null;
    if (audioContext.current) void audioContext.current.close();
    audioContext.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    recorder.current = null;
    setRecording(false);
  }, []);

  const stopRecording = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const startRecording = useCallback(
    async (onTranscript: (text: string) => void) => {
      setError("");
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        setError("Voice recording is not supported in this browser.");
        return;
      }
      try {
        const microphone = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const preferred = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
        ].find((type) => MediaRecorder.isTypeSupported(type));
        const activeRecorder = new MediaRecorder(
          microphone,
          preferred ? { mimeType: preferred } : undefined,
        );
        recorder.current = activeRecorder;
        stream.current = microphone;
        chunks.current = [];
        heardSpeech.current = false;
        receiveTranscript.current = onTranscript;
        activeRecorder.ondataavailable = (event) => {
          if (event.data.size) chunks.current.push(event.data);
        };
        activeRecorder.onerror = () => {
          setError("The recording could not be completed. Please try again.");
          cleanupRecording();
        };
        activeRecorder.onstop = () => {
          const audio = new Blob(chunks.current, {
            type: activeRecorder.mimeType || "audio/webm",
          });
          const containsSpeech = heardSpeech.current;
          cleanupRecording();
          if (!containsSpeech) {
            setError(
              "No speech was detected. Please try again and speak clearly.",
            );
            return;
          }
          setWorking(true);
          void api
            .transcribe(audio, language)
            .then((result) => receiveTranscript.current(result.transcript))
            .catch((reason: unknown) => setError(errorMessage(reason)))
            .finally(() => setWorking(false));
        };
        activeRecorder.start(250);
        setRecording(true);

        try {
          const context = new AudioContext();
          const source = context.createMediaStreamSource(microphone);
          const analyser = context.createAnalyser();
          const samples = new Uint8Array(analyser.fftSize);
          const startedAt = performance.now();
          let lastSpeechAt = startedAt;

          analyser.fftSize = 2_048;
          source.connect(analyser);
          audioContext.current = context;

          const detectSilence = () => {
            if (activeRecorder.state !== "recording") return;

            analyser.getByteTimeDomainData(samples);
            let sumOfSquares = 0;
            for (const sample of samples) {
              const amplitude = (sample - 128) / 128;
              sumOfSquares += amplitude * amplitude;
            }
            const level = Math.sqrt(sumOfSquares / samples.length);
            const now = performance.now();

            if (level >= SPEECH_LEVEL_THRESHOLD) {
              heardSpeech.current = true;
              lastSpeechAt = now;
            }

            const finishedSpeaking =
              heardSpeech.current &&
              now - lastSpeechAt >= SILENCE_AFTER_SPEECH_MS;
            const noSpeechDetected =
              !heardSpeech.current && now - startedAt >= NO_SPEECH_LIMIT_MS;

            if (finishedSpeaking || noSpeechDetected) {
              activeRecorder.stop();
              return;
            }
            silenceFrame.current = requestAnimationFrame(detectSilence);
          };

          silenceFrame.current = requestAnimationFrame(detectSilence);
        } catch {
          // Recording still stops at the maximum duration when Web Audio is unavailable.
        }
        timer.current = setTimeout(() => {
          if (activeRecorder.state === "recording") activeRecorder.stop();
        }, RECORDING_LIMIT_MS);
      } catch {
        cleanupRecording();
        setError("Microphone permission is needed for voice input.");
      }
    },
    [cleanupRecording, language],
  );

  const stopSpeaking = useCallback(() => {
    player.current?.pause();
    player.current = null;
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    audioUrl.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, sourceLanguage: SpeechLanguage = "en-IN") => {
      setError("");
      stopSpeaking();
      setWorking(true);
      try {
        const audio = await api.synthesize(
          text.slice(0, 2000),
          language,
          sourceLanguage,
        );
        const url = URL.createObjectURL(audio);
        const nextPlayer = new Audio(url);
        audioUrl.current = url;
        player.current = nextPlayer;
        nextPlayer.onended = stopSpeaking;
        nextPlayer.onerror = () => {
          setError("The generated audio could not be played.");
          stopSpeaking();
        };
        setSpeaking(true);
        await nextPlayer.play();
      } catch (reason) {
        stopSpeaking();
        setError(errorMessage(reason));
      } finally {
        setWorking(false);
      }
    },
    [language, stopSpeaking],
  );

  useEffect(
    () => () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      player.current?.pause();
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    },
    [],
  );

  return {
    language,
    setLanguage,
    recording,
    working,
    speaking,
    error,
    clearError: () => setError(""),
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}

const SpeechContext = createContext<ReturnType<typeof useSpeechState> | null>(
  null,
);

export function SpeechProvider({ children }: { children: ReactNode }) {
  const value = useSpeechState();
  return (
    <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>
  );
}

export function useSpeech() {
  const value = useContext(SpeechContext);
  if (!value) throw new Error("Speech provider is missing");
  return value;
}
