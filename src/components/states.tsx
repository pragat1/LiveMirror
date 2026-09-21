import { AlertCircle, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface flex flex-col items-center px-6 py-14 text-center", className)}>
      {Icon ? (
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-3 px-6 py-14 text-sm text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("surface flex flex-col items-center px-6 py-12 text-center", className)} role="alert">
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {onRetry ? (
        <Button className="mt-6" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
