import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as (new () => SpeechRecognitionLike) | null;
}

/**
 * Live transcription using the browser Speech Recognition API.
 * Returns supported=false when the browser has no implementation, so the UI can
 * offer the typed-answer fallback instead of silently failing.
 */
export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wantListeningRef = useRef(false);

  useEffect(() => {
    setSupported(Boolean(getRecognitionCtor()));
    return () => {
      wantListeningRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Live transcription isn't available in this browser.");
      return;
    }
    setError(null);
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> };
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const result = e.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          setFinalTranscript((prev) => `${prev} ${text}`.trim());
        } else {
          interimText += text;
        }
      }
      setInterim(interimText);
    };

    recognition.onerror = (event: unknown) => {
      const code = (event as { error?: string }).error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microphone access is required for spoken interview practice.");
        wantListeningRef.current = false;
        setListening(false);
      } else if (code === "no-speech") {
        setError("We couldn't capture your response. Please try again.");
      }
    };

    recognition.onend = () => {
      if (wantListeningRef.current) {
        try {
          recognition.start();
        } catch {
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    wantListeningRef.current = true;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("We couldn't start transcription. Please try again.");
    }
  }, []);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const reset = useCallback(() => {
    setFinalTranscript("");
    setInterim("");
  }, []);

  return { supported, listening, transcript: finalTranscript, interim, error, start, stop, reset, setFinalTranscript };
}
