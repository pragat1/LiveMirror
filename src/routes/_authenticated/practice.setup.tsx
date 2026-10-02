import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { OptionGrid } from "@/components/OptionGrid";
import { ResumeUploader } from "@/components/ResumeUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DIFFICULTIES, FOCUS_AREAS, INTERVIEW_TYPES, ROLES } from "@/lib/interview-options";

export const Route = createFileRoute("/_authenticated/practice/setup")({
  head: () => ({ meta: [{ title: "Set up your interview — Live Mirror" }] }),
  component: Setup,
});

const CUSTOM = "Custom role";
const LENGTHS = ["5 minutes", "10 minutes", "20 minutes", "Custom"] as const;

function Setup() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [type, setType] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState("");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [length, setLength] = useState<string>("10 minutes");
  const [customMinutes, setCustomMinutes] = useState(15);
  const [focus, setFocus] = useState<string[]>(["Answer quality", "Communication"]);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (!type && profile.preferred_interview_type) setType(profile.preferred_interview_type);
    if (!role && profile.target_role) {
      if ((ROLES as readonly string[]).includes(profile.target_role)) setRole(profile.target_role);
      else { setRole(CUSTOM); setCustomRole(profile.target_role); }
    }
    if (!difficulty && profile.default_difficulty) setDifficulty(profile.default_difficulty);
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const finalRole = role === CUSTOM ? customRole.trim() : role;
  const minutes = length === "Custom" ? customMinutes : parseInt(length, 10);
  const ready = Boolean(type && finalRole && difficulty && minutes > 0);

  const enter = async () => {
    if (!user || !ready) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: user.id,
        role: finalRole!,
        interview_type: type!,
        difficulty: difficulty!,
        planned_duration_minutes: minutes,
        focus_areas: focus,
        status: "created",
      })
      .select("id")
      .single();
    setCreating(false);
    if (error || !data) {
      toast.error("We couldn't create your session. Please try again.");
      return;
    }
    if (resumeText) sessionStorage.setItem(`lm-resume-${data.id}`, resumeText);
    navigate({ to: "/practice/session/$id", params: { id: data.id } });
  };

  const toggleFocus = (f: string) =>
    setFocus((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <AppShell title="New interview">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Step n={1} title="Interview type">
            <OptionGrid label="Interview type" options={INTERVIEW_TYPES} value={type} onChange={setType} />
          </Step>
          <Step n={2} title="Role">
            <OptionGrid label="Role" options={[...ROLES, CUSTOM]} value={role} onChange={setRole} />
            {role === CUSTOM ? (
              <Input className="mt-3" aria-label="Custom role" placeholder="e.g. DevOps Engineer" value={customRole} onChange={(e) => setCustomRole(e.target.value)} />
            ) : null}
          </Step>
          <Step n={3} title="Difficulty">
            <OptionGrid label="Difficulty" options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
          </Step>
          <Step n={4} title="Session length">
            <OptionGrid label="Session length" options={LENGTHS} value={length} onChange={setLength} columns="grid-cols-2 sm:grid-cols-4" />
            {length === "Custom" ? (
              <div className="mt-3 flex items-center gap-2">
                <Label htmlFor="mins">Minutes</Label>
                <Input id="mins" type="number" min={3} max={45} className="w-24" value={customMinutes} onChange={(e) => setCustomMinutes(Math.max(3, Math.min(45, Number(e.target.value) || 3)))} />
              </div>
            ) : null}
          </Step>
          <Step n={5} title="Resume (optional)">
            <ResumeUploader mode="session" onText={setResumeText} />
            {!resumeText ? <p className="mt-2 text-xs text-muted-foreground">Continue without a resume.</p> : null}
          </Step>
          <Step n={6} title="Interview focus">
            <OptionGrid label="Focus areas" options={FOCUS_AREAS} value={focus} onChange={toggleFocus} multiple />
          </Step>
        </div>

        <aside className="surface h-fit p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Session summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row k="Type" v={type} />
            <Row k="Role" v={finalRole} />
            <Row k="Difficulty" v={difficulty} />
            <Row k="Length" v={`${minutes} min`} />
            <Row k="Resume" v={resumeText ? "Included" : "None"} />
            <Row k="Focus" v={focus.join(", ") || "—"} />
          </dl>
          <Button className="mt-6 w-full" size="lg" disabled={!ready || creating} onClick={enter}>
            {creating ? "Preparing your interview…" : "Enter Interview Room"}
          </Button>
        </aside>
      </div>
    </AppShell>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="surface p-6">
      <h2 className="mb-4 flex items-center gap-3 text-base font-semibold">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v || "—"}</dd>
    </div>
  );
}
