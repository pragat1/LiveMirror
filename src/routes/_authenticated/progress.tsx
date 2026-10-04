import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { fetchSessions, type SessionReport } from "@/lib/sessions";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [{ title: "Progress — Live Mirror" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const q = useQuery({ queryKey: ["sessions"], queryFn: fetchSessions });
  const done = (q.data ?? []).filter((s) => s.status === "completed" && s.report).reverse();
  const points = done.map((s) => {
    const r = s.report as unknown as SessionReport;
    return {
      date: format(new Date(s.ended_at ?? s.created_at), "d MMM"),
      overall: Number(s.overall_score),
      answerQuality: r.categories.answerQuality ?? null,
      communication: r.categories.communication ?? null,
      pace: r.averageSpeakingRate ? Math.round(r.averageSpeakingRate) : null,
      filler: r.totalFillerWords,
    };
  });
  const all = q.data ?? [];

  return (
    <AppShell title="Progress">
      <h1 className="text-2xl font-semibold">Your progress</h1>
      {q.isLoading ? <LoadingState /> : q.isError ? <ErrorState onRetry={() => q.refetch()} /> : done.length < 2 ? (
        <EmptyState className="mt-6" icon={TrendingUp} title="Complete more interviews to unlock your progress trends."
          description={done.length === 1 ? "You've completed 1 session. One more and your trends appear here." : "Complete a few sessions to start seeing your improvement."}
          action={<Button asChild><Link to="/practice/setup">Start an interview</Link></Button>} />
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on {done.length} completed of {all.length} started sessions ({Math.round((done.length / Math.max(all.length, 1)) * 100)}% completion).
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <ChartCard title="Performance over time" data={points} lines={[{ key: "overall", color: "var(--chart-1)", name: "Overall" }]} domain={[0, 100]} />
            <ChartCard title="Answer quality & communication" data={points} lines={[{ key: "answerQuality", color: "var(--chart-2)", name: "Answer quality" }, { key: "communication", color: "var(--chart-3)", name: "Communication" }]} domain={[0, 100]} />
            <ChartCard title="Speaking pace (wpm)" data={points} lines={[{ key: "pace", color: "var(--chart-4)", name: "WPM" }]} />
            <ChartCard title="Filler words per session" data={points} lines={[{ key: "filler", color: "var(--chart-5)", name: "Filler words" }]} />
          </div>
        </>
      )}
    </AppShell>
  );
}

function ChartCard({ title, data, lines, domain }: { title: string; data: Record<string, unknown>[]; lines: { key: string; color: string; name: string }[]; domain?: [number, number] }) {
  return (
    <section className="surface p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={11} stroke="var(--muted-foreground)" />
            <YAxis fontSize={11} stroke="var(--muted-foreground)" domain={domain ?? ["auto", "auto"]} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
            {lines.map((l) => <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
