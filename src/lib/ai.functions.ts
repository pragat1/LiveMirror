import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const COACH_RULES = `You are an experienced, constructive interview coach and interviewer.
Rules you must always follow:
- Never fabricate the candidate's achievements, metrics, employers or projects.
- Never make medical, psychological or personality diagnoses.
- Describe observable communication behaviour only (pace, structure, specificity, filler words, clarity).
- Be specific, actionable and encouraging. Separate technical facts from subjective advice.
- Return the exact JSON object requested by the schema.`;

const questionsInput = z.object({
  role: z.string().min(1),
  interviewType: z.string().min(1),
  difficulty: z.string().min(1),
  experienceLevel: z.string().nullable(),
  targetCompany: z.string().nullable(),
  count: z.number().int().min(1).max(15),
  resumeText: z.string().nullable(),
  focusAreas: z.array(z.string()).nullable(),
});

const questionsSchema = z.object({
  questions: z.array(z.object({ question: z.string(), category: z.string() })).min(1),
});

export const generateQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => questionsInput.parse(input))
  .handler(async ({ data }) => {
    const { chatJson } = await import("./ai.server");
    const request = getRequest();
    const prompt = [
      `Create ${data.count} realistic interview questions for one session. Ask one question at a time, from warm-up to deeper.`,
      `Target role: ${data.role}; interview type: ${data.interviewType}; difficulty: ${data.difficulty}.`,
      data.experienceLevel ? `Candidate level: ${data.experienceLevel}.` : "",
      data.targetCompany ? `Target company: ${data.targetCompany}.` : "",
      data.focusAreas?.length ? `Coaching focus areas: ${data.focusAreas.join(", ")}.` : "",
      data.resumeText ? `Personalise from the supplied resume only; do not invent details:\n${data.resumeText.slice(0, 6000)}` : "",
    ].filter(Boolean).join("\n");
    const result = await chatJson(request, COACH_RULES, prompt, questionsSchema);
    return result.questions.slice(0, data.count).map((question, order) => ({ ...question, order }));
  });

const followUpInput = z.object({
  role: z.string(),
  interviewType: z.string(),
  difficulty: z.string(),
  previousQuestion: z.string(),
  previousAnswer: z.string(),
  askedQuestions: z.array(z.string()),
});

const followUpSchema = z.object({ question: z.string(), category: z.string() });

export const generateFollowUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => followUpInput.parse(input))
  .handler(async ({ data }) => {
    const { chatJson } = await import("./ai.server");
    const request = getRequest();
    const prompt = [
      `You are interviewing a ${data.role} candidate for a ${data.interviewType} interview at ${data.difficulty} difficulty.`,
      `Previous question: ${data.previousQuestion}`,
      `Candidate's actual transcript: ${data.previousAnswer.slice(0, 4000)}`,
      `Ask exactly one relevant follow-up about something they said. Do not repeat: ${JSON.stringify(data.askedQuestions)}`,
    ].join("\n");
    return chatJson(request, COACH_RULES, prompt, followUpSchema);
  });

const analyzeInput = z.object({
  role: z.string(),
  interviewType: z.string(),
  question: z.string(),
  transcript: z.string().min(1),
  durationSeconds: z.number().nonnegative(),
  speakingRate: z.number().nonnegative().nullable(),
  fillerWordCount: z.number().int().nonnegative(),
  focusAreas: z.array(z.string()).nullable(),
});

const answerAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  scores: z.object({
    relevance: z.number().min(0).max(100),
    structure: z.number().min(0).max(100),
    specificity: z.number().min(0).max(100),
    conciseness: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    technical: z.number().min(0).max(100).nullable(),
  }),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  star: z.object({
    situation: z.boolean(), task: z.boolean(), action: z.boolean(), result: z.boolean(), note: z.string().nullable(),
  }).nullable(),
  suggestedStructure: z.string(),
  improvedAnswer: z.string(),
  liveTips: z.array(z.string()),
});

export const analyzeAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => analyzeInput.parse(input))
  .handler(async ({ data }) => {
    const { chatJson } = await import("./ai.server");
    const request = getRequest();
    const behavioural = /behavio|hr|managerial|mixed/i.test(data.interviewType);
    const prompt = [
      "Evaluate a real spoken interview answer; this is an automatic transcript, so ignore punctuation errors.",
      `Role: ${data.role}. Interview: ${data.interviewType}. Question: ${data.question}`,
      `Candidate transcript: ${data.transcript.slice(0, 6000)}`,
      `Duration: ${Math.round(data.durationSeconds)} seconds. Measured pace: ${data.speakingRate ? Math.round(data.speakingRate) : "unavailable"} wpm. Detected filler words: ${data.fillerWordCount}.`,
      data.focusAreas?.length ? `Requested feedback focus: ${data.focusAreas.join(", ")}.` : "",
      behavioural
        ? "Assess situation, task, action and result; explain missing STAR elements without inventing details."
        : "Assess role-specific technical correctness and identify factual errors precisely.",
      "All scores are AI-estimated practice signals, 0–100, not a validated assessment.",
      "The improved answer must use only facts in the original transcript; never add achievements or metrics. Keep liveTips to at most three short actionable phrases.",
    ].filter(Boolean).join("\n");
    return chatJson(request, COACH_RULES, prompt, answerAnalysisSchema);
  });

const reportInput = z.object({
  role: z.string(),
  interviewType: z.string(),
  difficulty: z.string(),
  durationSeconds: z.number().nonnegative(),
  averageSpeakingRate: z.number().nullable(),
  totalFillerWords: z.number().int().nonnegative(),
  items: z.array(z.object({
    question: z.string(), transcript: z.string(), score: z.number().nullable(), summary: z.string().nullable(),
  })),
});

const reportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  categories: z.object({
    answerQuality: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    structure: z.number().min(0).max(100),
    conciseness: z.number().min(0).max(100),
    delivery: z.number().min(0).max(100),
    technical: z.number().min(0).max(100).nullable(),
  }),
  didWell: z.array(z.string()),
  toImprove: z.array(z.string()),
  strongestAnswerIndex: z.number().int().nullable(),
  nextSessionFocus: z.array(z.string()),
});

export const generateReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reportInput.parse(input))
  .handler(async ({ data }) => {
    const { chatJson } = await import("./ai.server");
    const request = getRequest();
    const prompt = [
      "Create a coaching report for this completed practice interview, based only on the candidate's actual answers.",
      `Role: ${data.role}; type: ${data.interviewType}; difficulty: ${data.difficulty}.`,
      `Duration: ${Math.round(data.durationSeconds / 60)} minutes. Average speaking rate: ${data.averageSpeakingRate ? Math.round(data.averageSpeakingRate) : "unavailable"} wpm. Detected filler words: ${data.totalFillerWords}.`,
      `Actual Q&A data: ${JSON.stringify(data.items).slice(0, 10000)}`,
      "Do not invent achievements. The strongest answer index must be a zero-based index into the supplied answers, or null if no answer can be selected. Scores are AI-estimated practice scores.",
    ].join("\n");
    return chatJson(request, COACH_RULES, prompt, reportSchema);
  });