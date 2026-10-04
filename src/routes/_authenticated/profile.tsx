import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { ResumeUploader } from "@/components/ResumeUploader";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DIFFICULTIES, EXPERIENCE_LEVELS, INTERVIEW_TYPES, PREPARING_FOR } from "@/lib/interview-options";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Live Mirror" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: "", target_role: "", experience_level: "", preferred_interview_type: "", default_difficulty: "", target_company: "", preparing_for: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name ?? "", target_role: profile.target_role ?? "", experience_level: profile.experience_level ?? "",
      preferred_interview_type: profile.preferred_interview_type ?? "", default_difficulty: profile.default_difficulty ?? "",
      target_company: profile.target_company ?? "", preparing_for: profile.preparing_for ?? "",
    });
  }, [profile]);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() || null])),
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("We couldn't save your profile.");
    await qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile saved.");
  };

  if (isLoading) return <AppShell title="Profile"><LoadingState /></AppShell>;

  return (
    <AppShell title="Profile">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="surface grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Full name" id="name"><Input id="name" value={form.full_name} onChange={(e) => set("full_name")(e.target.value)} /></Field>
          <Field label="Email" id="email"><Input id="email" value={profile?.email ?? user?.email ?? ""} disabled /></Field>
          <Field label="Target role" id="role"><Input id="role" value={form.target_role} onChange={(e) => set("target_role")(e.target.value)} /></Field>
          <Field label="Target company" id="company"><Input id="company" value={form.target_company} onChange={(e) => set("target_company")(e.target.value)} /></Field>
          <Picker label="Preparing for" value={form.preparing_for} options={PREPARING_FOR} onChange={set("preparing_for")} />
          <Picker label="Experience level" value={form.experience_level} options={EXPERIENCE_LEVELS} onChange={set("experience_level")} />
          <Picker label="Preferred interview type" value={form.preferred_interview_type} options={INTERVIEW_TYPES} onChange={set("preferred_interview_type")} />
          <Picker label="Default difficulty" value={form.default_difficulty} options={DIFFICULTIES} onChange={set("default_difficulty")} />
          <div className="sm:col-span-2"><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button></div>
        </section>
        <section className="surface h-fit p-6">
          <h2 className="font-semibold">Resume</h2>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">Used to personalise interview questions. Only text is stored, and only if you save it.</p>
          <ResumeUploader mode="save" />
        </section>
      </div>
    </AppShell>
  );
}

export function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>;
}

function Picker({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger aria-label={label}><SelectValue placeholder="Not set" /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
