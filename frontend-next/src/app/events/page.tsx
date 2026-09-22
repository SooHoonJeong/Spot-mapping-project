import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { EventsBrowser } from "@/features/events/components/events-browser";

export const metadata: Metadata = {
  title: "Events — Spot",
  description:
    "Browse offline and online events. Filter by category and format to find something to do.",
};

export default function EventsPage() {
  return (
    <PageShell>
      <EventsBrowser />
    </PageShell>
  );
}
