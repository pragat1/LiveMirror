import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Session } from "@/lib/sessions";
import { formatDuration } from "@/lib/speech-metrics";

export function InterviewHistoryCard({ session }: { session: Session }) {
  const done = session.status === "completed";
  const inner = (
    <div className="surface flex items-center gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary">
        <span className="font-display text-base font-semibold leading-none">
          {session.overall_score !== null ? Math.round(Number(session.overall_score)) : "—"}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{session.role}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {session.interview_type} · {session.difficulty} ·{" "}
          {format(new Date(session.created_at), "d MMM yyyy")}
          {session.duration_seconds ? ` · ${formatDuration(session.duration_seconds)}` : ""}
        </p>
      </div>
      <Badge variant={done ? "secondary" : "outline"}>{done ? "Completed" : "In progress"}</Badge>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
    </div>
  );
  return done ? (
    <Link to="/history/$id" params={{ id: session.id }} aria-label={`Open report for ${session.role}`}>
      {inner}
    </Link>
  ) : (
    <Link to="/practice/session/$id" params={{ id: session.id }} aria-label={`Resume ${session.role} session`}>
      {inner}
    </Link>
  );
}
