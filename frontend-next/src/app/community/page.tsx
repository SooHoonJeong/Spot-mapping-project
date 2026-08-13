import type { Metadata } from "next";
import { PageShell, PageHeading } from "@/components/page-shell";
import { CommunityFeed } from "@/features/community/components/community-feed";

export const metadata: Metadata = {
  title: "Community — Spot",
  description:
    "Share event tips, find plus-ones, and connect with people going to the same events.",
};

export default function CommunityPage() {
  return (
    <PageShell>
      <PageHeading pageKey="community" />
      <CommunityFeed />
    </PageShell>
  );
}
