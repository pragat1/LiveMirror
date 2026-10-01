import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function OptionGrid<T extends string>({
  options,
  value,
  onChange,
  label,
  multiple = false,
  columns = "sm:grid-cols-3",
}: {
  options: readonly T[];
  value: T | T[] | null;
  onChange: (v: T) => void;
  label: string;
  multiple?: boolean;
  columns?: string;
}) {
  const selected = (o: T) => (Array.isArray(value) ? value.includes(o) : value === o);
  return (
    <div role={multiple ? "group" : "radiogroup"} aria-label={label} className={cn("grid gap-2.5", columns)}>
      {options.map((o) => {
        const isOn = selected(o);
        return (
          <button
            key={o}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={isOn}
            onClick={() => onChange(o)}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all active:scale-[0.98]",
              isOn
                ? "border-primary bg-primary-soft text-accent-foreground"
                : "border-border bg-card hover:border-primary/40 hover:bg-accent/50",
            )}
          >
            {o}
            {isOn ? <Check className="size-4 shrink-0 text-primary" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}
