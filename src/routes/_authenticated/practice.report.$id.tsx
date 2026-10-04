import { createFileRoute } from "@tanstack/react-router";

import { ReportView } from "@/components/ReportView";

export const Route = createFileRoute("/_authenticated/practice/report/$id")({
  head: () => ({ meta: [{ title: "Your Interview Report — Live Mirror" }] }),
  component: () => <ReportView id={Route.useParams().id} />,
});
