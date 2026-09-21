import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Brain,
  FileText,
  GraduationCap,
  Layers,
  MessageSquareQuote,
  Repeat,
  Sparkles,
  Target,
  Users,
  Waves,
} from "lucide-react";

import { HeroMockup } from "@/components/marketing/HeroMockup";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Mirror — Practice smarter. Interview with confidence." },
      {
        name: "description",
        content:
          "Live Mirror is an AI-powered interview coach. Practice realistic interviews with your webcam, get feedback on your answers and delivery, and track your progress.",
      },
      { property: "og:title", content: "Live Mirror — AI interview practice space" },
      {
        property: "og:description",
        content:
          "Practice realistic interviews with AI, understand how you communicate, and improve with every session.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Brain,
    title: "AI Interviewer",
    body: "Questions generated for your role, level and interview type — one at a time, with real follow-ups.",
  },
  {
    icon: Waves,
    title: "Real-Time Coaching",
    body: "Quiet, unobtrusive signals on pace, filler words and answer length while you speak.",
  },
  {
    icon: MessageSquareQuote,
    title: "Answer Analysis",
    body: "Relevance, structure, specificity and conciseness — including STAR gaps for behavioural answers.",
  },
  {
    icon: Layers,
    title: "Communication Analysis",
    body: "Observable delivery signals from your own transcript. No labels, no diagnoses.",
  },
  {
    icon: FileText,
    title: "Interview Reports",
    body: "A question-by-question review with your actual transcript and concrete next steps.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    body: "Your scores, pace and filler words over time — built only from sessions you complete.",
  },
];

const STEPS = [
  { title: "Choose your interview", body: "Role, type, difficulty and how long you want to practise." },
  { title: "Practice with AI", body: "Camera on, mic on. Answer out loud, just like the real thing." },
  { title: "Review your performance", body: "Get a report built from your own answers and delivery." },
  { title: "Improve every session", body: "Come back, focus on one thing, and watch the trend move." },
];

const USE_CASES = [
  { icon: GraduationCap, title: "Students", body: "Build confidence before campus placements." },
  { icon: Sparkles, title: "Fresh Graduates", body: "Turn coursework and projects into strong answers." },
  { icon: Target, title: "Job Seekers", body: "Rehearse the questions you keep getting asked." },
  { icon: Repeat, title: "Career Switchers", body: "Practise telling a new story convincingly." },
  { icon: Users, title: "Professionals", body: "Stay sharp for managerial and system design rounds." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-blush">
      <SiteHeader />

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            AI-powered interview coach
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            Practice smarter.
            <br />
            Interview with <span className="text-gradient-brand">confidence.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Live Mirror helps you practice realistic interviews, improve your answers, and understand how you
            communicate — not just what you say.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2 rounded-xl">
              <Link to="/signup">
                Start Practicing Free <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to="/" hash="how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Camera and microphone stay on your device. Live Mirror does not record or store video.
          </p>
        </div>
        <HeroMockup />
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
        <h2 className="text-center text-3xl font-semibold sm:text-4xl">
          Everything you need to become interview-ready
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article key={title} className="surface p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">In four steps</p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">How it works</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="surface p-6">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-3xl font-semibold sm:text-4xl">Built for wherever you are</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {USE_CASES.map(({ icon: Icon, title, body }) => (
            <article key={title} className="surface p-5">
              <Icon className="size-5 text-lavender" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-6">
        <div className="surface bg-blush flex flex-col items-center gap-5 rounded-3xl px-6 py-14 text-center">
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            Your next interview should not be your first practice.
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Create an account and run your first session in a couple of minutes.
          </p>
          <Button asChild size="lg" className="gap-2 rounded-xl">
            <Link to="/signup">
              Start Practicing Free <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
