import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Camera, Mic, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { InterviewHistoryCard } from "@/components/InterviewHistoryCard";
import { Button } from "@/components/ui/button";
import { fetchSessions } from "@/lib/sessions";

export const Route = createFileRoute("/_authenticated/practice/")({
  head: () => ({ meta: [{ title: "Practice — Live Mirror" }] }),
  component: PracticeHome,
});

function PracticeHome() {
  const sessions = useQuery({ queryKey: ["sessions"], queryFn: fetchSessions });
  const inProgress = (sessions.data ?? []).filter((s) => s.status !== "completed");

  return (
    <AppShell title="Practice">
      <section className="surface bg-blush p-6 sm:p-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">Practice room</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Configure an interview, then answer out loud with your camera on. Your video stays on your device.
        </p>
        <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-2"><Camera className="size-4 text-primary" /> Camera for the mirror view</li>
          <li className="flex items-center gap-2"><Mic className="size-4 text-primary" /> Microphone for your answers</li>
          <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> No video is recorded</li>
        </ul>
        <Button asChild size="lg" className="mt-6 gap-2 rounded-xl">
          <Link to="/practice/setup">Set up an interview <ArrowRight className="size-4" /></Link>
        </Button>
      </section>
      {inProgress.length ? (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Unfinished sessions</h2>
          <div className="grid gap-3">
            {inProgress.map((s) => <InterviewHistoryCard key={s.id} session={s} />)}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
