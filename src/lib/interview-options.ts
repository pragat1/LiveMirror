export const PREPARING_FOR = [
  "Internship",
  "Campus placement",
  "Full-time job",
  "Career switch",
  "General interview practice",
] as const;

export const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "UI/UX Designer",
  "Product Manager",
  "Marketing",
  "Finance",
  "HR",
] as const;

export const EXPERIENCE_LEVELS = ["Student", "Fresher", "1–2 years", "3–5 years", "5+ years"] as const;

export const INTERVIEW_TYPES = [
  "HR / Behavioral",
  "Technical",
  "Coding",
  "System Design",
  "Managerial",
  "Mixed",
] as const;

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export const SESSION_LENGTHS = [5, 10, 20] as const;

export const FOCUS_AREAS = [
  "Answer quality",
  "Communication",
  "Confidence",
  "Conciseness",
  "Technical depth",
  "Body language",
] as const;

export function questionCountFor(minutes: number): number {
  return Math.max(3, Math.min(12, Math.round(minutes / 2.5)));
}
