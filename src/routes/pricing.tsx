import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Live Mirror" },
      { name: "description", content: "Start practicing interviews with Live Mirror for free. Pro plan coming soon." },
      { property: "og:title", content: "Pricing — Live Mirror" },
      { property: "og:description", content: "Start free. Pro plan with deeper analytics coming soon." },
    ],
  }),
  component: Pricing,
});

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    note: "Available now",
    features: ["Limited practice sessions", "Basic AI feedback", "Basic interview reports"],
    cta: true,
  },
  {
    name: "Pro",
    price: "Coming soon",
    note: "Payments are not enabled yet",
    features: [
      "More practice sessions",
      "Detailed analytics",
      "Resume-based interviews",
      "Advanced feedback",
      "Progress tracking",
    ],
    cta: false,
  },
];

function Pricing() {
  return (
    <div className="bg-blush min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-center text-4xl font-semibold">Simple pricing</h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          Start practicing for free. Paid plans will be available later — nothing is charged today.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {PLANS.map((plan) => (
            <article key={plan.name} className="surface flex flex-col p-7">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-3 font-display text-3xl font-semibold">{plan.price}</p>
              <p className="mt-1 text-xs text-muted-foreground">{plan.note}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.cta ? (
                <Button asChild className="mt-8">
                  <Link to="/signup">Start Practicing Free</Link>
                </Button>
              ) : (
                <Button className="mt-8" variant="outline" disabled>
                  Coming soon
                </Button>
              )}
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
