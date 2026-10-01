import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Mic } from "lucide-react";
import { useEffect } from "react";

import { AppShell } from "@/components/app/AppShell";
import { InterviewHistoryCard } from "@/components/InterviewHistoryCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useAuth";
import { fetchSessions, type Session } from "@/lib/sessions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Live Mirror" }] }),
  component: Dashboard,
});

function computeStreak(sessions: Session[]): number {
  const days = new Set(
    sessions.filter((s) => s.status === "completed" && s.ended_at).map((s) => new Date(s.ended_at!).toDateString()),
  );
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function Dashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const sessions = useQuery({ queryKey: ["sessions"], queryFn: fetchSessions });

  useEffect(() => {
    if (!profileLoading && profile && !profile.onboarding_completed) navigate({ to: "/onboarding" });
  }, [profile, profileLoading, navigate]);

  const completed = (sessions.data ?? []).filter((s) => s.status === "completed");
  const scored = completed.filter((s) => s.overall_score !== null);
  const avg = scored.length ? Math.round(scored.reduce((a, s) => a + Number(s.overall_score), 0) / scored.length) : null;
  const minutes = Math.round(completed.reduce((a, s) => a + (s.duration_seconds ?? 0), 0) / 60);
  const streak = computeStreak(completed);

  return (
    <AppShell title={profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : undefined}>
      <section className="surface bg-blush flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Ready for your next interview?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {profile?.target_role
              ? `Practising for ${profile.target_role}${profile.target_company ? ` at ${profile.target_company}` : ""}.`
              : "Set up a session and start practising."}
          </p>
        </div>
        <Button asChild size="lg" className="gap-2 rounded-xl">
          <Link to="/practice/setup">
            Start New Interview <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>

      {sessions.isLoading ? (
        <LoadingState label="Loading your sessions…" />
      ) : sessions.isError ? (
        <ErrorState className="mt-6" description="We couldn't load your sessions." onRetry={() => sessions.refetch()} />
      ) : completed.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Mic}
          title="No interviews yet."
          description="Complete your first practice session to see your performance here."
          action={
            <Button asChild>
              <Link to="/practice/setup">Start Your First Interview</Link>
            </Button>
          }
        />
      ) : (
        <>
          <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Your statistics">
            <Stat label="Interviews completed" value={String(completed.length)} />
            <Stat label="Practice time" value={`${minutes} min`} />
            <Stat label="Average AI-estimated score" value={avg !== null ? String(avg) : "—"} />
            <Stat label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
          </section>
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent sessions</h2>
              <Link to="/history" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-3">
              {(sessions.data ?? []).slice(0, 4).map((s) => (
                <InterviewHistoryCard key={s.id} session={s} />
              ))}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
