import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { OptionGrid } from "@/components/OptionGrid";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Live Mirror" }] }),
  component: SettingsPage,
});

const THEMES = ["Light", "Dark", "System"] as const;

function applyTheme(t: string) {
  const dark = t === "Dark" || (t === "System" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const removeAccount = useServerFn(deleteMyAccount);
  const [theme, setTheme] = useState<string>("Light");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [cam, setCam] = useState(""); const [mic, setMic] = useState(""); const [spk, setSpk] = useState("");

  useEffect(() => {
    setTheme(localStorage.getItem("lm-theme") ?? "Light");
    setCam(localStorage.getItem("lm-camera") ?? ""); setMic(localStorage.getItem("lm-mic") ?? ""); setSpk(localStorage.getItem("lm-speaker") ?? "");
    navigator.mediaDevices?.enumerateDevices().then(setDevices).catch(() => {});
  }, []);

  const chooseTheme = (t: string) => { setTheme(t); localStorage.setItem("lm-theme", t); applyTheme(t); };
  const pick = (key: string, setter: (v: string) => void) => (v: string) => { setter(v); localStorage.setItem(key, v); };

  const deleteHistory = async () => {
    if (!user) return;
    const { error } = await supabase.from("interview_sessions").delete().eq("user_id", user.id);
    if (error) return toast.error("We couldn't delete your history.");
    await supabase.from("progress_metrics").delete().eq("user_id", user.id);
    await qc.invalidateQueries();
    toast.success("Interview history deleted.");
  };
  const deleteResume = async () => {
    if (!user) return;
    const { error } = await supabase.from("resumes").delete().eq("user_id", user.id);
    if (error) return toast.error("We couldn't delete your resume.");
    await qc.invalidateQueries({ queryKey: ["resume"] });
    toast.success("Resume deleted.");
  };
  const deleteAccount = async () => {
    try {
      await removeAccount();
      await signOut();
      navigate({ to: "/", replace: true });
      toast.success("Your account has been deleted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "We couldn't delete your account.");
    }
  };

  const byKind = (k: MediaDeviceKind) => devices.filter((d) => d.kind === k && d.deviceId);

  return (
    <AppShell title="Settings">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="mt-6 space-y-5">
        <Card title="Account">
          <p className="text-sm"><span className="text-muted-foreground">Name: </span>{profile?.full_name ?? "—"}</p>
          <p className="text-sm"><span className="text-muted-foreground">Email: </span>{user?.email}</p>
          <p className="text-xs text-muted-foreground">Edit your name and interview defaults on the Profile page.</p>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/profile" })}>Edit profile & interview preferences</Button>
        </Card>

        <Card title="Appearance">
          <OptionGrid label="Theme" options={THEMES} value={theme} onChange={chooseTheme} />
        </Card>

        <Card title="Audio & video">
          {devices.length === 0 || !devices.some((d) => d.label) ? (
            <p className="text-sm text-muted-foreground">Device names appear after you allow camera and microphone access once in the interview room.</p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3">
            <DevicePicker label="Camera" devices={byKind("videoinput")} value={cam} onChange={pick("lm-camera", setCam)} />
            <DevicePicker label="Microphone" devices={byKind("audioinput")} value={mic} onChange={pick("lm-mic", setMic)} />
            <DevicePicker label="Speaker" devices={byKind("audiooutput")} value={spk} onChange={pick("lm-speaker", setSpk)} />
          </div>
        </Card>

        <Card title="Privacy">
          <p className="text-sm text-muted-foreground">Live Mirror never records or stores your video.</p>
          <div className="flex flex-wrap gap-2">
            <Confirm label="Delete interview history" title="Delete all interview history?" body="All sessions, transcripts, reports and progress data will be permanently removed." onConfirm={deleteHistory} />
            <Confirm label="Delete resume" title="Delete your saved resume?" body="The extracted resume text saved to your account will be removed." onConfirm={deleteResume} />
            <Confirm label="Delete account" title="Delete your account?" body="Your account and every piece of data tied to it will be permanently deleted. This cannot be undone." onConfirm={deleteAccount} />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="surface space-y-3 p-6"><h2 className="font-semibold">{title}</h2>{children}</section>;
}

function DevicePicker({ label, devices, value, onChange }: { label: string; devices: MediaDeviceInfo[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || undefined} onValueChange={onChange} disabled={!devices.length}>
        <SelectTrigger aria-label={label}><SelectValue placeholder="System default" /></SelectTrigger>
        <SelectContent>{devices.map((d, i) => <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || `${label} ${i + 1}`}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function Confirm({ label, title, body, onConfirm }: { label: string; title: string; body: string; onConfirm: () => void | Promise<void> }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="outline" className="text-destructive">{label}</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{body}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => void onConfirm()}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
