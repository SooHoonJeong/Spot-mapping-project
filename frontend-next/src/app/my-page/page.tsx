import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { MyPageDashboard } from "@/features/mypage/components/my-page-dashboard";

export const metadata: Metadata = {
  title: "My Page — Spot",
  description:
    "Manage the events you host and the community posts you've shared.",
};

export default function MyPage() {
  return (
    <PageShell>
      <MyPageDashboard />
    </PageShell>
  );
}
