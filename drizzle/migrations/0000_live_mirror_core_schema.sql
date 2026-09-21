-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  target_role TEXT,
  experience_level TEXT,
  preferred_interview_type TEXT,
  target_company TEXT,
  preparing_for TEXT,
  default_difficulty TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile delete" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- SESSIONS
CREATE TABLE public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  interview_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  planned_duration_minutes INTEGER NOT NULL DEFAULT 10,
  focus_areas TEXT[] NOT NULL DEFAULT '{}',
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  overall_score NUMERIC,
  report JSONB,
  status TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_sessions TO authenticated;
GRANT ALL ON public.interview_sessions TO service_role;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions select" ON public.interview_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sessions insert" ON public.interview_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sessions update" ON public.interview_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sessions delete" ON public.interview_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- QUESTIONS
CREATE TABLE public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_questions TO authenticated;
GRANT ALL ON public.interview_questions TO service_role;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own questions select" ON public.interview_questions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own questions insert" ON public.interview_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own questions update" ON public.interview_questions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own questions delete" ON public.interview_questions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ANSWERS
CREATE TABLE public.interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  duration_seconds INTEGER,
  speaking_rate NUMERIC,
  filler_word_count INTEGER,
  filler_words JSONB,
  answer_score NUMERIC,
  analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_answers TO authenticated;
GRANT ALL ON public.interview_answers TO service_role;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own answers select" ON public.interview_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own answers insert" ON public.interview_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own answers update" ON public.interview_answers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own answers delete" ON public.interview_answers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PROGRESS METRICS
CREATE TABLE public.progress_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_metrics TO authenticated;
GRANT ALL ON public.progress_metrics TO service_role;
ALTER TABLE public.progress_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own metrics select" ON public.progress_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own metrics insert" ON public.progress_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own metrics delete" ON public.progress_metrics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RESUMES
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  file_path TEXT,
  extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resumes select" ON public.resumes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own resumes insert" ON public.resumes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own resumes update" ON public.resumes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own resumes delete" ON public.resumes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PROFILE AUTO-CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_sessions_user ON public.interview_sessions(user_id, created_at DESC);
CREATE INDEX idx_questions_session ON public.interview_questions(session_id, question_order);
CREATE INDEX idx_answers_session ON public.interview_answers(session_id);
CREATE INDEX idx_metrics_user ON public.progress_metrics(user_id, created_at);