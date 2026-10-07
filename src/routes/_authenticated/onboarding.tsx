import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { OptionGrid } from "@/components/OptionGrid";
import { ResumeUploader } from "@/components/ResumeUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EXPERIENCE_LEVELS, INTERVIEW_TYPES, PREPARING_FOR, ROLES } from "@/lib/interview-options";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Set up your practice — Live Mirror" }] }),
  component: Onboarding,
});

const CUSTOM = "Custom role";

function Onboarding() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [preparingFor, setPreparingFor] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState<string | null>(null);
  const [interviewType, setInterviewType] = useState<string | null>(null);
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.full_name && !fullName) setFullName(profile.full_name);
  }, [profile, fullName]);

  const finalRole = role === CUSTOM ? customRole.trim() : role;
  const steps = [
    { title: "What are you preparing for?", valid: Boolean(preparingFor && fullName.trim()) },
    { title: "What role are you targeting?", valid: Boolean(finalRole) },
    { title: "What's your experience level?", valid: Boolean(experience) },
    { title: "Which interview type do you want most?", valid: Boolean(interviewType) },
    { title: "Anything else? (optional)", valid: true },
  ];

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: fullName.trim(),
        preparing_for: preparingFor,
        target_role: finalRole,
        experience_level: experience,
        preferred_interview_type: interviewType,
        target_company: company.trim() || null,
        onboarding_completed: true,
      });
    setSaving(false);
    if (error) {
      toast.error("We couldn't save your preferences. Please try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="bg-blush min-h-screen px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Logo />
        <div className="surface mt-8 p-6 sm:p-8">
          <p className="text-xs font-medium text-muted-foreground">
            Step {step + 1} of {steps.length}
          </p>
          <Progress value={((step + 1) / steps.length) * 100} className="mt-2 h-1.5" />
          <h1 className="mt-6 text-2xl font-semibold">{steps[step]?.title}</h1>

          <div className="mt-6 space-y-5">
            {step === 0 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Your name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <OptionGrid label="Preparing for" options={PREPARING_FOR} value={preparingFor} onChange={setPreparingFor} columns="sm:grid-cols-2" />
              </>
            ) : null}
            {step === 1 ? (
              <>
                <OptionGrid label="Target role" options={[...ROLES, CUSTOM]} value={role} onChange={setRole} />
                {role === CUSTOM ? (
                  <div className="space-y-2">
                    <Label htmlFor="customRole">Your role</Label>
                    <Input id="customRole" value={customRole} onChange={(e) => setCustomRole(e.target.value)} placeholder="e.g. Cloud Engineer" />
                  </div>
                ) : null}
              </>
            ) : null}
            {step === 2 ? (
              <OptionGrid label="Experience level" options={EXPERIENCE_LEVELS} value={experience} onChange={setExperience} />
            ) : null}
            {step === 3 ? (
              <OptionGrid label="Interview type" options={INTERVIEW_TYPES} value={interviewType} onChange={setInterviewType} />
            ) : null}
            {step === 4 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company">Target company</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Resume (PDF)</Label>
                  <ResumeUploader mode="save" />
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-8 flex justify-between gap-3">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            {step < steps.length - 1 ? (
            <Button disabled={!steps[step]?.valid} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button onClick={finish} disabled={saving}>
                {saving ? "Saving…" : "Finish setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
