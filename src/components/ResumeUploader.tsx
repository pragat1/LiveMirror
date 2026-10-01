import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { extractPdfText } from "@/lib/pdf";

export function useSavedResume() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["resume", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * mode="save": always saves extracted text to the account (onboarding/settings).
 * mode="session": text is used for this session only unless the user ticks "save".
 */
export function ResumeUploader({
  mode,
  onText,
}: {
  mode: "save" | "session";
  onText?: (text: string | null) => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: saved } = useSavedResume();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [sessionFile, setSessionFile] = useState<string | null>(null);
  const [saveIt, setSaveIt] = useState(mode === "save");

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setBusy(true);
    try {
      const text = await extractPdfText(file);
      if (text.length < 40) {
        toast.error("We couldn't read text from this PDF. Try a text-based (not scanned) resume.");
        return;
      }
      if (saveIt && user) {
        await supabase.from("resumes").delete().eq("user_id", user.id);
        const { error } = await supabase
          .from("resumes")
          .insert({ user_id: user.id, file_name: file.name, extracted_text: text });
        if (error) throw error;
        await queryClient.invalidateQueries({ queryKey: ["resume"] });
        toast.success("Resume saved to your account.");
      }
      setSessionFile(file.name);
      onText?.(text);
    } catch {
      toast.error("We couldn't process that resume. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!user) return;
    const { error } = await supabase.from("resumes").delete().eq("user_id", user.id);
    if (error) {
      toast.error("We couldn't delete your resume.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["resume"] });
    toast.success("Resume deleted.");
    onText?.(null);
  };

  return (
    <div className="space-y-3">
      {saved ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="size-4 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{saved.file_name ?? "Saved resume"}</p>
              <p className="text-xs text-muted-foreground">Saved to your account</p>
            </div>
          </div>
          <div className="flex gap-1">
            {mode === "session" ? (
              <Button size="sm" variant="outline" onClick={() => { setSessionFile(saved.file_name); onText?.(saved.extracted_text); }}>
                Use this
              </Button>
            ) : null}
            <Button size="icon" variant="ghost" aria-label="Delete saved resume" onClick={remove}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No resume uploaded.</p>
      )}

      {sessionFile && mode === "session" ? (
        <p className="text-xs font-medium text-success">Using “{sessionFile}” for this session.</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy} className="gap-2">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {busy ? "Reading resume…" : "Upload PDF"}
        </Button>
        {mode === "session" ? (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={saveIt} onCheckedChange={(v) => setSaveIt(Boolean(v))} />
            Save to my account
          </label>
        ) : null}
      </div>
    </div>
  );
}
