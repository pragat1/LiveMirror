import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, ChevronUp, Loader2, Sparkles, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand/Logo";
import { WebcamPanel } from "@/components/interview/WebcamPanel";
import { ErrorState, LoadingState } from "@/components/states";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { useMedia } from "@/hooks/useMedia";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { analyzeAnswer, generateFollowUp, generateQuestions, generateReport } from "@/lib/ai.functions";
import { questionCountFor } from "@/lib/interview-options";
import {
  errorMessage,
  fetchSessionDetail,
  type Answer,
  type AnswerAnalysis,
  type Question,
  type Session,
  type SessionReport,
} from "@/lib/sessions";
import { analyzeSpeech, formatDuration, liveHints } from "@/lib/speech-metrics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/practice/session/$id")({
  head: () => ({ meta: [{ title: "Interview room — Live Mirror" }] }),
  component: InterviewRoom,
});

type Phase = "loading" | "error" | "permissions" | "idle" | "answering" | "analyzing" | "feedback" | "finishing";

function InterviewRoom() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const media = useMedia();
  const speech = useSpeechRecognition();

  const genQuestions = useServerFn(generateQuestions);
  const genFollowUp = useServerFn(generateFollowUp);
  const analyze = useServerFn(analyzeAnswer);
  const genReport = useServerFn(generateReport);

  const [phase, setPhase] = useState<Phase>("loading");
  const [loadingLabel, setLoadingLabel] = useState("Preparing your interview…");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [answerStart, setAnswerStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [roomStart] = useState(Date.now());
  const [lastAnalysis, setLastAnalysis] = useState<AnswerAnalysis | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(true);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [online, setOnline] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    const on = () => setOnline(true);
    const off = () => { setOnline(false); toast.error("Your connection was interrupted."); };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => { clearInterval(t); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const init = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      setLoadingLabel("Preparing your interview…");
      const detail = await fetchSessionDetail(id);
      if (!detail.session) throw new Error("This session doesn't exist.");
      if (detail.session.status === "completed") {
        navigate({ to: "/practice/report/$id", params: { id }, replace: true });
        return;
      }
      setSession(detail.session);
      let qs = detail.questions;
      if (qs.length === 0) {
        setLoadingLabel("Generating your questions…");
        const generated = await genQuestions({
          data: {
            role: detail.session.role,
            interviewType: detail.session.interview_type,
            difficulty: detail.session.difficulty,
            experienceLevel: profile?.experience_level ?? null,
            targetCompany: profile?.target_company ?? null,
            count: questionCountFor(detail.session.planned_duration_minutes),
            resumeText: sessionStorage.getItem(`lm-resume-${id}`),
            focusAreas: detail.session.focus_areas,
          },
        });
        const { data, error: insErr } = await supabase
          .from("interview_questions")
          .insert(generated.map((g) => ({ session_id: id, user_id: user!.id, question_text: g.question, question_order: g.order, category: g.category })))
          .select("*");
        if (insErr) throw insErr;
        qs = (data ?? []).sort((a, b) => a.question_order - b.question_order);
      }
      setQuestions(qs);
      setAnswers(detail.answers);
      const answered = new Set(detail.answers.map((a) => a.question_id));
      const next = qs.findIndex((q) => !answered.has(q.id));
      setIndex(next === -1 ? qs.length : next);
      setPhase("permissions");
    } catch (e) {
      setError(errorMessage(e) || "We couldn't connect to the AI interviewer. Please try again.");
      setPhase("error");
    }
  }, [id, genQuestions, navigate, profile, user]);

  useEffect(() => {
    if (initRef.current || !user || profile === undefined) return;
    initRef.current = true;
    void init();
  }, [init, user, profile]);

  const enterRoom = async () => {
    await media.request();
    if (session && !session.started_at) {
      await supabase.from("interview_sessions").update({ started_at: new Date().toISOString(), status: "in_progress" }).eq("id", id);
    }
    setPhase(index >= questions.length ? "feedback" : "idle");
  };

  const current = questions[index];
  const answerSeconds = answerStart ? (now - answerStart) / 1000 : 0;
  const liveText = speech.supported ? `${speech.transcript} ${speech.interim}`.trim() : typed;
  const liveMetrics = useMemo(() => analyzeSpeech(liveText, answerSeconds), [liveText, answerSeconds]);
  const hints = phase === "answering" ? liveHints(liveMetrics) : [];
  const elapsedRoom = (now - roomStart) / 1000;
  const overTime = session ? elapsedRoom > session.planned_duration_minutes * 60 : false;

  const startAnswer = () => {
    speech.reset();
    setTyped("");
    setLastAnalysis(null);
    setAnswerStart(Date.now());
    if (speech.supported && media.micState === "granted") speech.start();
    setPhase("answering");
  };

  const submitAnswer = async () => {
    if (!current || !session || !user) return;
    speech.stop();
    const transcript = (speech.supported && media.micState === "granted" ? `${speech.transcript} ${speech.interim}` : typed).trim();
    const duration = answerStart ? (Date.now() - answerStart) / 1000 : 0;
    if (transcript.split(/\s+/).length < 3) {
      toast.error("We couldn't capture your response. Please try again.");
      setPhase("idle");
      return;
    }
    setPhase("analyzing");
    const metrics = analyzeSpeech(transcript, duration);
    try {
      const analysis = await analyze({
        data: {
          role: session.role,
          interviewType: session.interview_type,
          question: current.question_text,
          transcript,
          durationSeconds: duration,
          speakingRate: metrics.speakingRate,
          fillerWordCount: metrics.fillerWordCount,
          focusAreas: session.focus_areas,
        },
      });
      const { data, error: insErr } = await supabase
        .from("interview_answers")
        .insert({
          session_id: id,
          question_id: current.id,
          user_id: user.id,
          transcript,
          duration_seconds: Math.round(duration),
          speaking_rate: metrics.speakingRate ? Math.round(metrics.speakingRate) : null,
          filler_word_count: metrics.fillerWordCount,
          filler_words: metrics.fillerWords as Json,
          answer_score: Math.round(analysis.score),
          analysis: analysis as unknown as Json,
        })
        .select("*")
        .single();
      if (insErr) throw insErr;
      setAnswers((a) => [...a, data]);
      setLastAnalysis(analysis);
      setPhase("feedback");
    } catch (e) {
      toast.error(errorMessage(e));
      setTyped(transcript);
      setPhase("idle");
    }
  };

  const nextQuestion = () => {
    setLastAnalysis(null);
    setIndex((i) => i + 1);
    setPhase(index + 1 >= questions.length ? "feedback" : "idle");
  };

  const followUp = async () => {
    const last = answers[answers.length - 1];
    if (!session || !current || !last || !user) return;
    setPhase("analyzing");
    try {
      const fu = await genFollowUp({
        data: {
          role: session.role,
          interviewType: session.interview_type,
          difficulty: session.difficulty,
          previousQuestion: current.question_text,
          previousAnswer: last.transcript,
          askedQuestions: questions.map((q) => q.question_text),
        },
      });
      const order = index + 1;
      // shift later questions so the follow-up comes next
      const later = questions.slice(index + 1);
      for (const q of later) {
        await supabase.from("interview_questions").update({ question_order: q.question_order + 1 }).eq("id", q.id);
      }
      const { data, error: insErr } = await supabase
        .from("interview_questions")
        .insert({ session_id: id, user_id: user.id, question_text: fu.question, question_order: order, category: fu.category ?? "Follow-up" })
        .select("*")
        .single();
      if (insErr) throw insErr;
      setQuestions((qs) => [...qs.slice(0, index + 1), data, ...later.map((q) => ({ ...q, question_order: q.question_order + 1 }))]);
      setLastAnalysis(null);
      setIndex(index + 1);
      setPhase("idle");
    } catch (e) {
      toast.error(errorMessage(e));
      setPhase("feedback");
    }
  };

  const finish = async () => {
    setConfirmEnd(false);
    speech.stop();
    if (!session || !user) return;
    if (answers.length === 0) {
      await supabase.from("interview_sessions").delete().eq("id", id);
      media.release();
      toast("Session discarded — no answers were given.");
      navigate({ to: "/dashboard" });
      return;
    }
    setPhase("finishing");
    try {
      const rates = answers.map((a) => Number(a.speaking_rate)).filter((n) => n > 0);
      const avgRate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : null;
      const fillerWords: Record<string, number> = {};
      for (const a of answers) {
        for (const [w, c] of Object.entries((a.filler_words as Record<string, number>) ?? {})) fillerWords[w] = (fillerWords[w] ?? 0) + c;
      }
      const totalFiller = Object.values(fillerWords).reduce((a, b) => a + b, 0);
      const duration = Math.round(elapsedRoom);
      const qById = new Map(questions.map((q) => [q.id, q]));
      const report = await genReport({
        data: {
          role: session.role,
          interviewType: session.interview_type,
          difficulty: session.difficulty,
          durationSeconds: duration,
          averageSpeakingRate: avgRate,
          totalFillerWords: totalFiller,
          items: answers.map((a) => ({
            question: qById.get(a.question_id)?.question_text ?? "",
            transcript: a.transcript,
            score: a.answer_score !== null ? Number(a.answer_score) : null,
            summary: (a.analysis as AnswerAnalysis | null)?.summary ?? null,
          })),
        },
      });
      const fullReport: SessionReport = { ...report, averageSpeakingRate: avgRate, totalFillerWords: totalFiller, fillerWords };
      const score = Math.round(report.overallScore);
      const { error: upErr } = await supabase
        .from("interview_sessions")
        .update({ status: "completed", ended_at: new Date().toISOString(), duration_seconds: duration, overall_score: score, report: fullReport as unknown as Json })
        .eq("id", id);
      if (upErr) throw upErr;
      const metrics: { metric_name: string; metric_value: number }[] = [
        { metric_name: "overall_score", metric_value: score },
        { metric_name: "filler_words", metric_value: totalFiller },
        ...(avgRate ? [{ metric_name: "speaking_rate", metric_value: Math.round(avgRate) }] : []),
        ...Object.entries(report.categories)
          .filter(([, v]) => typeof v === "number")
          .map(([k, v]) => ({ metric_name: k, metric_value: v as number })),
      ];
      await supabase.from("progress_metrics").insert(metrics.map((m) => ({ ...m, user_id: user.id, session_id: id })));
      sessionStorage.removeItem(`lm-resume-${id}`);
      media.release();
      navigate({ to: "/practice/report/$id", params: { id } });
    } catch (e) {
      toast.error(errorMessage(e));
      setPhase("feedback");
    }
  };

  if (phase === "loading") return <FullCenter><LoadingState label={loadingLabel} /></FullCenter>;
  if (phase === "error")
    return (
      <FullCenter>
        <ErrorState title="We couldn't connect to the AI interviewer" description={error ?? undefined} onRetry={() => void init()} />
        <Button asChild variant="link" className="mt-4"><Link to="/dashboard">Back to dashboard</Link></Button>
      </FullCenter>
    );

  if (phase === "permissions")
    return (
      <FullCenter>
        <div className="surface max-w-md p-8 text-center">
          <LogoMark className="mx-auto" />
          <h1 className="mt-4 text-2xl font-semibold">Ready to enter the room?</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We'll ask for your camera and microphone. Your camera is only shown to you — no video is recorded or uploaded.
            Your spoken answers are transcribed and analysed by AI.
          </p>
          {!speech.supported ? (
            <p className="mt-3 rounded-xl bg-warning/15 p-3 text-xs">
              Live transcription isn't supported in this browser. You can type your answers instead, or use Chrome or Edge for spoken practice.
            </p>
          ) : null}
          <Button className="mt-6 w-full" size="lg" onClick={enterRoom}>Allow camera & microphone</Button>
        </div>
      </FullCenter>
    );

  const allAnswered = index >= questions.length;
  const useTyping = !speech.supported || media.micState !== "granted";

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-sm font-semibold">{session?.role}</p>
            <p className="text-xs text-muted-foreground">{session?.interview_type} · {session?.difficulty}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className={cn("font-mono tabular-nums", overTime && "text-warning")} aria-label="Session time">
            {formatDuration(elapsedRoom)} / {session?.planned_duration_minutes}:00
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {online ? <Wifi className="size-3.5 text-success" /> : <WifiOff className="size-3.5 text-destructive" />}
            {online ? "Connected" : "Offline"}
          </span>
          <Button size="sm" variant="outline" onClick={() => setConfirmEnd(true)} disabled={phase === "finishing"}>End interview</Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 p-4 sm:p-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <WebcamPanel
            stream={media.stream}
            cameraState={media.cameraState}
            cameraOn={media.cameraOn}
            micOn={media.micOn}
            recording={phase === "answering" && speech.listening}
            onToggleCamera={media.toggleCamera}
            onToggleMic={media.toggleMic}
            onEnd={() => setConfirmEnd(true)}
          />
          {media.micState === "denied" ? (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              Microphone access is required for spoken interview practice. You can type your answers below instead.
            </p>
          ) : null}
          {speech.error ? <p className="text-sm text-destructive" role="alert">{speech.error}</p> : null}

          {/* Live mirror signals */}
          <section className="surface p-4" aria-label="Live feedback">
            <button className="flex w-full items-center justify-between text-sm font-semibold" onClick={() => setFeedbackOpen((o) => !o)} aria-expanded={feedbackOpen}>
              <span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Live mirror</span>
              {feedbackOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            {feedbackOpen ? (
              phase === "answering" ? (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Metric label="Answer time" value={formatDuration(answerSeconds)} />
                    <Metric label="Pace" value={liveMetrics.speakingRate ? `${Math.round(liveMetrics.speakingRate)} wpm` : "—"} />
                    <Metric label="Filler words" value={String(liveMetrics.fillerWordCount)} />
                  </div>
                  <div className="flex flex-wrap gap-2" aria-live="polite">
                    {hints.map((h) => (
                      <span key={h} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{h}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Signals appear while you answer, measured from your own speech.</p>
              )
            ) : null}
          </section>
        </div>

        <aside className="surface flex flex-col p-5" aria-label="AI interviewer">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">AI Interviewer</p>
          {!allAnswered && current ? (
            <>
              <p className="mt-1 text-xs text-muted-foreground">Question {index + 1} of {questions.length}{current.category ? ` · ${current.category}` : ""}</p>
              <h2 className="mt-4 text-lg font-semibold leading-snug">{current.question_text}</h2>
            </>
          ) : (
            <h2 className="mt-4 text-lg font-semibold">That's all the questions for this session.</h2>
          )}

          <div className="mt-5 flex-1 space-y-4">
            {phase === "answering" ? (
              useTyping ? (
                <Textarea autoFocus rows={7} placeholder="Type your answer…" value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Your answer" />
              ) : (
                <div className="min-h-32 rounded-xl bg-muted/50 p-3 text-sm leading-relaxed" aria-live="polite">
                  {liveText || <span className="text-muted-foreground">Start speaking — your words will appear here.</span>}
                </div>
              )
            ) : null}

            {phase === "analyzing" ? <LoadingState label="Analyzing your response…" className="py-6" /> : null}
            {phase === "finishing" ? <LoadingState label="Building your interview report…" className="py-6" /> : null}

            {phase === "feedback" && lastAnalysis ? (
              <div className="space-y-3 rounded-2xl bg-primary-soft/60 p-4">
                <p className="text-sm">{lastAnalysis.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {lastAnalysis.liveTips.map((t) => (
                    <span key={t} className="rounded-full bg-card px-3 py-1 text-xs font-medium">{t}</span>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">AI-estimated practice score: {Math.round(lastAnalysis.score)}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {phase === "idle" && current ? <Button size="lg" onClick={startAnswer}>Start answering</Button> : null}
            {phase === "answering" ? <Button size="lg" onClick={submitAnswer}>I'm done answering</Button> : null}
            {phase === "feedback" && !allAnswered ? (
              <>
                <Button size="lg" onClick={nextQuestion} disabled={overTime && index + 1 >= questions.length}>
                  {index + 1 >= questions.length ? "Finish questions" : "Next question"}
                </Button>
                <Button variant="outline" onClick={followUp}>Ask me a follow-up</Button>
              </>
            ) : null}
            {phase === "feedback" && allAnswered ? <Button size="lg" onClick={finish}>Get my report</Button> : null}
            {overTime && phase !== "finishing" ? (
              <p className="text-center text-xs text-warning">You've reached your planned time. Wrap up when ready.</p>
            ) : null}
          </div>
        </aside>
      </main>

      <AlertDialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this interview?</AlertDialogTitle>
            <AlertDialogDescription>
              {answers.length
                ? `We'll build your report from the ${answers.length} answer${answers.length === 1 ? "" : "s"} you gave.`
                : "You haven't answered any questions yet, so this session will be discarded."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep practicing</AlertDialogCancel>
            <AlertDialogAction onClick={() => void finish()}>End interview</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FullCenter({ children }: { children: React.ReactNode }) {
  return <div className="bg-blush flex min-h-screen flex-col items-center justify-center px-5">{children}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-2 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export { Loader2 };
