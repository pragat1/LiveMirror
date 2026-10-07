import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Session = Tables<"interview_sessions">;
export type Question = Tables<"interview_questions">;
export type Answer = Tables<"interview_answers">;

export type AnswerAnalysis = {
  score: number;
  scores?: Record<string, number | null>;
  summary: string;
  strengths: string[];
  improvements: string[];
  star?: { situation: boolean; task: boolean; action: boolean; result: boolean; note?: string } | null;
  suggestedStructure?: string;
  improvedAnswer?: string;
  liveTips: string[];
};

export type SessionReport = {
  overallScore: number;
  summary: string;
  categories: Record<string, number | null>;
  didWell: string[];
  toImprove: string[];
  strongestAnswerIndex: number | null;
  nextSessionFocus: string[];
  averageSpeakingRate: number | null;
  totalFillerWords: number;
  fillerWords: Record<string, number>;
};

export async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSessionDetail(id: string) {
  const [s, q, a] = await Promise.all([
    supabase.from("interview_sessions").select("*").eq("id", id).maybeSingle(),
    supabase.from("interview_questions").select("*").eq("session_id", id).order("question_order"),
    supabase.from("interview_answers").select("*").eq("session_id", id).order("created_at"),
  ]);
  if (s.error) throw s.error;
  if (q.error) throw q.error;
  if (a.error) throw a.error;
  return { session: s.data, questions: q.data ?? [], answers: a.data ?? [] };
}

export async function fetchSessionDetail(id: string) {
  const [s, q, a] = await Promise.all([
    supabase.from("interview_sessions").select("*").eq("id", id).maybeSingle(),
    supabase.from("interview_questions").select("*").eq("session_id", id).order("question_order"),
    supabase.from("interview_answers").select("*").eq("session_id", id).order("created_at"),
  ]);
  if (s.error) throw s.error;
  if (q.error) throw q.error;
  if (a.error) throw a.error;
  return { session: s.data, questions: q.data ?? [], answers: a.data ?? [] };
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Your connection was interrupted.";
}
