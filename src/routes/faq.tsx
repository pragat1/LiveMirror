import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Live Mirror" },
      { name: "description", content: "Answers about Live Mirror's AI interview practice, privacy, recording and data." },
      { property: "og:title", content: "FAQ — Live Mirror" },
      { property: "og:description", content: "How Live Mirror works, what it stores and how accurate the feedback is." },
    ],
  }),
  component: Faq,
});

const FAQS: ReadonlyArray<readonly [string, string]> = [
  ["What is Live Mirror?", "Live Mirror is an AI interview practice space. You answer interview questions out loud with your camera on, and get feedback on both what you said and how you said it."],
  ["How does AI interview practice work?", "You pick a role, interview type and difficulty. The AI generates questions for that context and asks them one at a time. Your spoken answer is transcribed in your browser, then analysed by AI for relevance, structure, specificity and delivery."],
  ["Does Live Mirror record video?", "No. Your camera is used only as a live mirror on your screen. Video is never uploaded or stored."],
  ["Is my data private?", "Your sessions, transcripts and reports are tied to your account and protected so that no other user can access them. Nothing is shared unless you choose to share it."],
  ["Can I practice technical interviews?", "Yes. Choose Technical, Coding or System Design and the AI will ask role-relevant questions and check technical correctness in its feedback."],
  ["Can I upload my resume?", "Yes, as a PDF. Text is extracted in your browser and used to personalise questions. It is only saved to your account if you choose to save it, and you can delete it any time."],
  ["Can I practice for different roles?", "Yes. Pick from common roles or type a custom one for each session."],
  ["How accurate is the AI feedback?", "Scores are AI estimates meant for practice, not a validated assessment. Use them as directional coaching, not a guarantee of interview outcomes."],
  ["Can I delete my interview data?", "Yes. From Settings you can delete your interview history, your saved resume, or your entire account."],
];

function Faq() {
  return (
    <div className="bg-blush min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-semibold">Frequently asked questions</h1>
        <Accordion type="single" collapsible className="surface mt-10 px-6">
          {FAQS.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <SiteFooter />
    </div>
  );
}
