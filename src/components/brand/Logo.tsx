import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="2.8" width="17" height="18.4" rx="6" />
        <path d="M12 7.2c.7 2.1 1.6 3 3.6 3.7-2 .7-2.9 1.6-3.6 3.7-.7-2.1-1.6-3-3.6-3.7 2-.7 2.9-1.6 3.6-3.7Z" fill="currentColor" stroke="none" />
        <path d="M8.6 17.4h6.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Logo({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold tracking-tight">Live Mirror</span>
        {subtitle ? (
          <span className="block text-[11px] font-medium tracking-wide text-muted-foreground">
            Practice. Reflect. Improve.
          </span>
        ) : null}
      </span>
    </span>
  );
}
