import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { InterviewHistoryCard } from "@/components/InterviewHistoryCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INTERVIEW_TYPES } from "@/lib/interview-options";
import { fetchSessions } from "@/lib/sessions";

export const Route = createFileRoute("/_authenticated/history/")({
  head: () => ({ meta: [{ title: "Interview History — Live Mirror" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const q = useQuery({ queryKey: ["sessions"], queryFn: fetchSessions });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("newest");

  const list = useMemo(() => {
    let rows = (q.data ?? []).filter((s) => s.status === "completed");
    if (type !== "all") rows = rows.filter((s) => s.interview_type === type);
    if (search.trim()) rows = rows.filter((s) => `${s.role} ${s.interview_type}`.toLowerCase().includes(search.toLowerCase()));
    return sort === "oldest" ? [...rows].reverse() : rows;
  }, [q.data, search, type, sort]);

  const hasAny = (q.data ?? []).some((s) => s.status === "completed");

  return (
    <AppShell title="Interview History">
      <h1 className="text-2xl font-semibold">Interview History</h1>
      {q.isLoading ? <LoadingState /> : q.isError ? <ErrorState onRetry={() => q.refetch()} /> : !hasAny ? (
        <EmptyState className="mt-6" icon={HistoryIcon} title="No completed interviews yet." description="Your completed interviews will appear here."
          action={<Button asChild><Link to="/practice/setup">Start an interview</Link></Button>} />
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Input placeholder="Search by role…" aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="sm:w-52" aria-label="Filter by interview type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {INTERVIEW_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="sm:w-40" aria-label="Sort"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-5 grid gap-3">
            {list.length ? list.map((s) => <InterviewHistoryCard key={s.id} session={s} />) : <p className="text-sm text-muted-foreground">No sessions match your filters.</p>}
          </div>
        </>
      )}
    </AppShell>
  );
}
