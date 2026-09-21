import { Eye, Gauge, Mic, Timer, Video } from "lucide-react";

/**
 * Static UI illustration for the landing page only.
 * The numbers here are illustrative product artwork, not anyone's real results.
 */
export function HeroMockup() {
  return (
    <figure className="surface overflow-hidden rounded-3xl p-3 shadow-[var(--shadow-lift)]">
      <figcaption className="sr-only">
        Illustration of the Live Mirror interview room interface. Values shown are example artwork, not real
        user data.
      </figcaption>
      <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Live Mirror — practice room</span>
        <span className="inline-flex items-center gap-1.5">
          <Timer className="size-3.5" aria-hidden="true" /> 04:12
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-muted to-primary-soft">
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium">
            <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />
            Camera preview
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3">
            {[Mic, Video, Eye].map((Icon, i) => (
              <span
                key={i}
                className="inline-flex size-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-[var(--shadow-soft)]"
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl bg-secondary/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              AI interviewer
            </p>
            <p className="mt-1.5 text-sm leading-snug">
              Tell me about a project you're proud of and the hardest problem you solved.
            </p>
          </div>
          <div className="rounded-2xl border border-border p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Live signals
            </p>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-mint" aria-hidden="true" /> Steady eye contact
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" /> Pace picking up
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-sky" aria-hidden="true" /> Clear structure
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
            <Gauge className="size-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">Delivery signal</p>
              <p className="text-sm font-semibold">Example interface</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 px-1 text-[11px] text-muted-foreground">
        Interface illustration. Your own session shows only your real measured signals.
      </p>
    </figure>
  );
}
