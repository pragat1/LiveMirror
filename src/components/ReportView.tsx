import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Copy, Download, FileQuestion } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchSessionDetail, type AnswerAnalysis, type SessionReport } from "@/lib/sessions";
import { formatDuration } from "@/lib/speech-metrics";

const CATEGORY_LABELS: Record<string, string> = {
  answerQuality: "Answer Quality",
  communication: "Communication",
  structure: "Structure",
  conciseness: "Conciseness",
  delivery: "Confidence / Delivery",
  technical: "Technical Knowledge",
};

export function ReportView({ id }: { id: string }) {
  const q = useQuery({ queryKey: ["session", id], queryFn: () => fetchSessionDetail(id) });

  if (q.isLoading) return <AppShell title="Report"><LoadingState label="Loading your report…" /></AppShell>;
  if (q.isError) return <AppShell title="Report"><ErrorState description="We couldn't load this report." onRetry={() => q.refetch()} /></AppShell>;
  const { session, questions, answers } = q.data!;
  if (!session) return <AppShell title="Report"><EmptyState icon={FileQuestion} title="Report not found" /></AppShell>;
  const report = session.report as unknown as SessionReport | null;
  if (session.status !== "completed" || !report)
    return (
      <AppShell title="Report">
        <EmptyState
          icon={FileQuestion}
          title="This interview isn't finished yet."
          action={<Button asChild><Link to="/practice/session/$id" params={{ id }}>Resume interview</Link></Button>}
        />
      </AppShell>
    );

  const qById = new Map(questions.map((x) => [x.id, x]));
  const items = answers.map((a) => ({ a, q: qById.get(a.question_id), an: a.analysis as unknown as AnswerAnalysis | null }));
  const strongest = items.length
    ? (report.strongestAnswerIndex !== null && items[report.strongestAnswerIndex]) ||
      [...items].sort((x, y) => Number(y.a.answer_score ?? 0) - Number(x.a.answer_score ?? 0))[0]
    : null;

  const transcriptText = items.map(({ a, q: qq }) => `AI: ${qq?.question_text ?? ""}\nYou: ${a.transcript}`).join("\n\n");
  const copy = async () => { await navigator.clipboard.writeText(transcriptText); toast.success("Transcript copied."); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([transcriptText], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `live-mirror-${session.role.replace(/\W+/g, "-")}-${format(new Date(session.created_at), "yyyy-MM-dd")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="Your Interview Report">
      <section className="surface bg-blush flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex size-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-primary/30 bg-card">
          <span className="font-display text-4xl font-semibold">{Math.round(report.overallScore)}</span>
          <span className="text-[10px] text-muted-foreground">of 100</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Your Interview Report</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {session.role} · {session.interview_type} · {session.difficulty} · {format(new Date(session.created_at), "d MMM yyyy")}
            {session.duration_seconds ? ` · ${formatDuration(session.duration_seconds)}` : ""}
          </p>
          <p className="mt-3 text-sm leading-relaxed">{report.summary}</p>
          <p className="mt-2 text-[11px] text-muted-foreground">AI-estimated practice score — not a validated assessment.</p>
        </div>
      </section>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Question review</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Object.entries(report.categories).filter(([, v]) => typeof v === "number").map(([k, v]) => (
              <div key={k} className="surface p-4">
                <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[k] ?? k}</p>
                <p className="mt-1 font-display text-2xl font-semibold">{Math.round(v as number)}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, v as number)}%` }} /></div>
              </div>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ListCard title="What You Did Well" items={report.didWell} tone="good" />
            <ListCard title="What To Improve" items={report.toImprove} tone="improve" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="surface p-5">
              <h3 className="font-semibold">Filler Words</h3>
              {Object.keys(report.fillerWords ?? {}).length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(report.fillerWords).sort((a, b) => b[1] - a[1]).map(([w, c]) => (
                    <li key={w} className="rounded-full bg-secondary px-3 py-1 text-sm">“{w}” × {c}</li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-muted-foreground">No filler words were detected.</p>}
            </div>
            <div className="surface p-5">
              <h3 className="font-semibold">Speaking Pace</h3>
              {report.averageSpeakingRate ? (
                <>
                  <p className="mt-2 font-display text-3xl font-semibold">{Math.round(report.averageSpeakingRate)} <span className="text-base font-normal text-muted-foreground">words / min</span></p>
                  <p className="mt-1 text-xs text-muted-foreground">Calculated from your transcript. Many speakers aim for roughly 120–160 wpm in interviews.</p>
                </>
              ) : <p className="mt-2 text-sm text-muted-foreground">Not enough spoken audio to calculate pace.</p>}
            </div>
          </div>

          {strongest ? (
            <div className="surface p-5">
              <h3 className="font-semibold">Strongest Answer</h3>
              <p className="mt-2 text-sm font-medium">{strongest.q?.question_text}</p>
              <blockquote className="mt-2 border-l-2 border-primary pl-3 text-sm text-muted-foreground">{strongest.a.transcript}</blockquote>
              {strongest.an?.improvedAnswer ? (
                <>
                  <h4 className="mt-4 text-sm font-semibold">Answer Improvement</h4>
                  <p className="mt-1 text-sm">{strongest.an.improvedAnswer}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Rewritten only from what you said — no invented experience.</p>
                </>
              ) : null}
            </div>
          ) : null}

          {report.nextSessionFocus?.length ? <ListCard title="Focus for next session" items={report.nextSessionFocus} tone="neutral" /> : null}

          <Button asChild size="lg"><Link to="/practice/setup">Practice again</Link></Button>
        </TabsContent>

        <TabsContent value="questions" className="mt-5 space-y-4">
          {items.map(({ a, q: qq, an }, i) => (
            <article key={a.id} className="surface p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">Q{i + 1}. {qq?.question_text}</h3>
                {a.answer_score !== null ? <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-accent-foreground">{Math.round(Number(a.answer_score))}</span> : null}
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your answer</p>
              <p className="mt-1 text-sm">{a.transcript}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {a.duration_seconds ? `${formatDuration(a.duration_seconds)}` : ""}{a.speaking_rate ? ` · ${a.speaking_rate} wpm` : ""}{` · ${a.filler_word_count ?? 0} filler words`}
              </p>
              {an ? (
                <div className="mt-4 space-y-3 text-sm">
                  <p>{an.summary}</p>
                  {an.star ? (
                    <div className="flex flex-wrap gap-2">
                      {(["situation", "task", "action", "result"] as const).map((k) => {
                        const included = an.star?.[k] ?? false;
                        return <span key={k} className={`rounded-full px-2.5 py-1 text-xs ${included ? "bg-success/15" : "bg-warning/20"}`}>{k[0]?.toUpperCase()}{k.slice(1)} {included ? "✓" : "missing"}</span>;
                      })}
                      {an.star.note ? <p className="w-full text-xs text-muted-foreground">{an.star.note}</p> : null}
                    </div>
                  ) : null}
                  <div className="grid gap-3 md:grid-cols-2">
                    <ListCard title="Strengths" items={an.strengths} tone="good" compact />
                    <ListCard title="Improvement" items={an.improvements} tone="improve" compact />
                  </div>
                  {an.suggestedStructure ? <p><span className="font-semibold">Suggested structure: </span>{an.suggestedStructure}</p> : null}
                </div>
              ) : null}
            </article>
          ))}
        </TabsContent>

        <TabsContent value="transcript" className="mt-5">
          <div className="mb-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={copy} className="gap-2"><Copy className="size-4" /> Copy transcript</Button>
            <Button variant="outline" size="sm" onClick={download} className="gap-2"><Download className="size-4" /> Download</Button>
          </div>
          <div className="surface space-y-4 p-5">
            {items.map(({ a, q: qq }) => (
              <div key={a.id} className="space-y-1.5 text-sm">
                <p><span className="font-semibold text-primary">AI: </span>{qq?.question_text}</p>
                <p><span className="font-semibold">You: </span>{a.transcript}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ListCard({ title, items, tone, compact }: { title: string; items: string[]; tone: "good" | "improve" | "neutral"; compact?: boolean }) {
  const dot = tone === "good" ? "bg-success" : tone === "improve" ? "bg-warning" : "bg-lavender";
  return (
    <div className={compact ? "rounded-xl bg-muted/40 p-4" : "surface p-5"}>
      <h3 className={compact ? "text-sm font-semibold" : "font-semibold"}>{title}</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {items.map((t) => (
          <li key={t} className="flex gap-2"><span className={`mt-2 size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />{t}</li>
        ))}
      </ul>
    </div>
  );
}
