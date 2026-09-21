export const FILLER_WORDS = [
  "um",
  "uh",
  "erm",
  "hmm",
  "like",
  "basically",
  "actually",
  "literally",
  "kinda",
  "sorta",
  "yeah",
  "so",
  "right",
  "okay",
];

export type SpeechMetrics = {
  wordCount: number;
  durationSeconds: number;
  speakingRate: number | null;
  fillerWords: Record<string, number>;
  fillerWordCount: number;
};

export function analyzeSpeech(transcript: string, durationSeconds: number): SpeechMetrics {
  const words = transcript
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const fillerWords: Record<string, number> = {};
  for (const word of words) {
    if (FILLER_WORDS.includes(word)) {
      fillerWords[word] = (fillerWords[word] ?? 0) + 1;
    }
  }
  const fillerWordCount = Object.values(fillerWords).reduce((a, b) => a + b, 0);

  return {
    wordCount: words.length,
    durationSeconds,
    speakingRate: durationSeconds > 5 ? (words.length / durationSeconds) * 60 : null,
    fillerWords,
    fillerWordCount,
  };
}

/** Small, non-judgemental live coaching hints derived from measured signals only. */
export function liveHints(metrics: SpeechMetrics): string[] {
  const hints: string[] = [];
  if (metrics.speakingRate && metrics.speakingRate > 175) hints.push("Speaking quickly — try pausing");
  if (metrics.speakingRate && metrics.speakingRate < 105 && metrics.wordCount > 30)
    hints.push("Pace is slow — add energy");
  if (metrics.fillerWordCount >= 4) hints.push(`${metrics.fillerWordCount} filler words so far`);
  if (metrics.durationSeconds > 150) hints.push("Answer is getting long");
  if (metrics.wordCount > 40 && metrics.fillerWordCount <= 1) hints.push("Clear, steady delivery");
  return hints.slice(0, 3);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
