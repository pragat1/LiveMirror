import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const COACH_RULES = `You are an experienced, constructive interview coach and interviewer.
Rules you must always follow:
- Never fabricate the candidate's achievements, metrics, employers or projects.
- Never make medical, psychological or personality diagnoses. Never call anyone anxious, insecure or unstable.
- Describe observable communication behaviour only (pace, structure, specificity, filler words, clarity).
- Be specific, actionable and encouraging. Never insult or discourage.
- Separate factual technical errors from subjective communication advice.
- Reply with valid JSON only, matching the requested shape exactly.`;

const questionsInput = z.object({
  role: z.string().min(1),
  interviewType: z.string().min(1),
  difficulty: z.string().min(1),
  experienceLevel: z.string().optional().nullable(),
  targetCompany: z.string().optional().nullable(),
  count: z.number().int().min(1).max(15),
  resumeText: z.string().optional().nullable(),
  focusAreas: z.array(z.string()).optional().nullable(),
});

export const generateQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => questionsInput.parse(input))
  .handler(async ({ data }) => {
    const { chatJson } = await import("./ai.server");
    const prompt = [
      `Create ${data.count} interview questions for a live mock interview.`,
      `Target role: ${data.role}`,
      `Interview type: ${data.interviewType}`,
      `Difficulty: ${data.difficulty}`,
      data.experienceLevel ? `Candidate experience level: ${data.experienceLevel}` : "",
      data.targetCompany ? `Target company: ${data.targetCompany}` : "",
      data.focusAreas?.length ? `Coaching focus areas: ${data.focusAreas.join(", ")}` : "",
      data.resumeText
        ? `Use this resume text to personalise questions. Only reference things actually written here:\n"""${data.resumeText.slice(0, 6000)}"""`
        : "",
      `Ask one question at a time, ordered from warm-up to deeper. Do not number them in the text.`,
      `Return JSON: { "questions": [ { "question": string, "category": string } ] }`,
    ]
      .filter(Boolean)
      .join("\n");

    const json = await chatJson(COACH_RULES, prompt);
    const parsed = z
      .object({
        questions: z.array(z.object({ question: z.string(), category: z.string().optional() })).min(1),
      })
      .parse(json);
    return parsed.questions.slice(0, data.count).map((q, i) => ({
      question: q.question,
      category: q.category ?? data.interviewType,
      order: i,
    }));
  });

const followUpInput = z.object({
  role: z.string(),
  interviewType: z.string(),
  difficulty: z.string(),
  previousQuestion: z.string(),
  previousAnswer: z.string(),
  askedQuestions: z.array(z.string()),
});

export const generateFollowUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => followUpInput.parse(input))
  .handler(async ({ data }) => {
    const { chatJson } = await import("./ai.server");
    const prompt = [
      `You are mid-interview for a ${data.role} (${data.interviewType}, ${data.difficulty} difficulty).`,
      `You asked: "${data.previousQuestion}"`,
      `The candidate answered (raw transcript): """${data.previousAnswer.slice(0, 4000)}"""`,
      `Ask ONE coherent follow-up question that digs into something the candidate actually said.`,
      `Never repeat any of these already-asked questions: ${JSON.stringify(data.askedQuestions)}`,
      `Return JSON: { "question": string, "category": string }`,
    ].join("\n");
    const json = await chatJson(COACH_RULES, prompt);
    return z.object({ question: z.string(), category: z.string().optional() }).parse(json);
  });

const analyzeInput = z.object({
  role: z.string(),
  interviewType: z.string(),
  question: z.string(),
  transcript: z.string().min(1),
  durationSeconds: z.number().nonnegative(),
  speakingRate: z.number().nonnegative().nullable().optional(),
  fillerWordCount: z.number().int().nonnegative().nullable().optional(),
  focusAreas: z.array(z.string()).optional().nullable(),
});

export const analyzeAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => analyzeInput.parse(input))
  .handler(async ({ data }) => {
    const { chatJson } = await import("./ai.server");
    const behavioural = /behavio|hr|managerial|mixed/i.test(data.interviewType);
    const prompt = [
      `Evaluate one spoken interview answer. The transcript is automatic speech-to-text, so ignore punctuation errors.`,
      `Role: ${data.role}. Interview type: ${data.interviewType}.`,
      `Question: "${data.question}"`,
      `Answer transcript: """${data.transcript.slice(0, 6000)}"""`,
      `Answer duration: ${Math.round(data.durationSeconds)} seconds.`,
      data.speakingRate ? `Measured speaking rate: ${Math.round(data.speakingRate)} words per minute.` : "",
      typeof data.fillerWordCount === "number" ? `Detected filler words: ${data.fillerWordCount}.` : "",
      data.focusAreas?.length ? `Candidate wants feedback on: ${data.focusAreas.join(", ")}.` : "",
      behavioural
        ? `Also assess the STAR framework and say which elements are missing. Do not invent results the candidate never mentioned.`
        : `Also assess technical correctness and flag any factual errors precisely.`,
      `Scores are 0-100 AI estimates for practice only.`,
      `Return JSON: {
        "score": number,
        "scores": { "relevance": number, "structure": number, "specificity": number, "conciseness": number, "communication": number, "technical": number | null },
        "summary": string,
        "strengths": string[],
        "improvements": string[],
        "star": { "situation": boolean, "task": boolean, "action": boolean, "result": boolean, "note": string } | null,
        "suggestedStructure": string,
        "improvedAnswer": string,
        "liveTips": string[]
      }`,
      `"improvedAnswer" must rewrite ONLY the content the candidate actually gave, better structured. Never add invented facts. "liveTips" are at most 3 short coaching phrases (max 5 words each).`,
    ]
      .filter(Boolean)
      .join("\n");

    const json = await chatJson(COACH_RULES, prompt);
    return z
      .object({
        score: z.number(),
        scores: z.record(z.string(), z.number().nullable()).optional(),
        summary: z.string(),
        strengths: z.array(z.string()).default([]),
        improvements: z.array(z.string()).default([]),
        star: z
          .object({
            situation: z.boolean(),
            task: z.boolean(),
            action: z.boolean(),
            result: z.boolean(),
            note: z.string().optional(),
          })
          .nullable()
          .optional(),
        suggestedStructure: z.string().optional(),
        improvedAnswer: z.string().optional(),
        liveTips: z.array(z.string()).default([]),
      })
      .parse(json);
  });

const reportInput = z.object({
  role: z.string(),
  interviewType: z.string(),
  difficulty: z.string(),
  durationSeconds: z.number().nonnegative(),
  averageSpeakingRate: z.number().nullable(),
  totalFillerWords: z.number(),
  items: z.array(
    z.object({
      question: z.string(),
      transcript: z.string(),
      score: z.number().nullable(),
      summary: z.string().nullable(),
    }),
  ),
});

export const generateReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reportInput.parse(input))
  .handler(async ({ data }) => {
    const { chatJson } = await import("./ai.server");
    const prompt = [
      `Write the closing coaching report for a completed mock interview.`,
      `Role: ${data.role}. Type: ${data.interviewType}. Difficulty: ${data.difficulty}.`,
      `Session length: ${Math.round(data.durationSeconds / 60)} minutes.`,
      data.averageSpeakingRate ? `Average speaking rate: ${Math.round(data.averageSpeakingRate)} wpm.` : "",
      `Total filler words detected: ${data.totalFillerWords}.`,
      `Answers given:\n${JSON.stringify(data.items).slice(0, 12000)}`,
      `Base every observation strictly on the answers above. Do not invent achievements.`,
      `Return JSON: {
        "overallScore": number,
        "summary": string,
        "categories": { "answerQuality": number, "communication": number, "structure": number, "conciseness": number, "delivery": number, "technical": number | null },
        "didWell": string[],
        "toImprove": string[],
        "strongestAnswerIndex": number,
        "nextSessionFocus": string[]
      }`,
    ]
      .filter(Boolean)
      .join("\n");

    const json = await chatJson(COACH_RULES, prompt);
    return z
      .object({
        overallScore: z.number(),
        summary: z.string(),
        categories: z.record(z.string(), z.number().nullable()),
        didWell: z.array(z.string()).default([]),
        toImprove: z.array(z.string()).default([]),
        strongestAnswerIndex: z.number().int().nullable().default(null),
        nextSessionFocus: z.array(z.string()).default([]),
      })
      .parse(json);
  });
