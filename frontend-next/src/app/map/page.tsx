import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { MapExplorer } from "@/features/events/components/map-explorer";

export const metadata: Metadata = {
  title: "Map — Spot",
  description:
    "Explore nearby events on an interactive map. Tap a pin to see event details.",
};

export default function MapPage() {
  return (
    <PageShell>
      <MapExplorer />
    </PageShell>
  );
}
