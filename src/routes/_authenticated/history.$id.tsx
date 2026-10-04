import { createFileRoute } from "@tanstack/react-router";

import { ReportView } from "@/components/ReportView";

export const Route = createFileRoute("/_authenticated/history/$id")({
  head: () => ({ meta: [{ title: "Interview report — Live Mirror" }] }),
  component: () => <ReportView id={Route.useParams().id} />,
});
