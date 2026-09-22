import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CommunityWriteBackLink } from "@/features/community/components/community-write-back-link";
import { CommunityPostForm } from "@/features/community/components/community-post-form";

export const metadata: Metadata = {
  title: "Write a post — Spot",
  description: "Share an event tip, recap, photo, or video with the Spot community.",
};

export default function CommunityWritePage() {
  return (
    <PageShell>
      <CommunityWriteBackLink />
      <CommunityPostForm />
    </PageShell>
  );
}
