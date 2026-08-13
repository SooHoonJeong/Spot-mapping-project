import type { Metadata } from "next";
import { PageShell, PageHeading } from "@/components/page-shell";
import { CreateEventForm } from "@/features/mypage/components/create-event-form";

export const metadata: Metadata = {
  title: "Create Event — Spot",
  description:
    "Create a new offline event by setting its details and picking a location on the map.",
};

export default function CreateEventPage() {
  return (
    <PageShell>
      <PageHeading pageKey="myPageCreate" />
      <CreateEventForm />
    </PageShell>
  );
}
