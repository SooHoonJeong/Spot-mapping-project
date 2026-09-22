import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CreateEventWizard } from "@/features/mypage/components/create-event-wizard";

export const metadata: Metadata = {
  title: "Create Event — Spot",
  description:
    "Create a new offline event by setting its details and picking a location on the map.",
};

export default function CreateEventPage() {
  return (
    <PageShell>
      <CreateEventWizard />
    </PageShell>
  );
}
