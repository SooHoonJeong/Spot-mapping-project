import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";
import { RequireAdmin } from "@/features/auth/components/RequireAdmin";

export const metadata: Metadata = {
  title: "Admin — Spot",
  robots: { index: false, follow: false },
};

// /admin 아래 모든 페이지의 접근 제어는 여기 한 곳에서 한다.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell>
      <RequireAdmin next="/admin">{children}</RequireAdmin>
    </PageShell>
  );
}
