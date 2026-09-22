import type { ReactNode } from "react";
import { SiteFooter } from "@/components/host-cta";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
