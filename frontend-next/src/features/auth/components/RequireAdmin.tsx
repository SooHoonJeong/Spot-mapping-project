"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { useIsAdmin } from "../lib/useIsAdmin";

const REDIRECT_DELAY_MS = 3000;

// 관리자만 볼 수 있는 화면을 감싼다. 비로그인이면 로그인 페이지로, 로그인했지만 관리자가 아니면
// "권한이 없습니다" 화면을 보여준 뒤 메인으로 돌려보낸다. 확인이 끝나기 전에는 아무것도 그리지 않는다.
export function RequireAdmin({ next, children }: { next: string; children: ReactNode }) {
  const router = useRouter();
  const { t } = useTranslation();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isAdmin = useIsAdmin();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoggedIn) {
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!isAdmin) {
      const timer = setTimeout(() => router.replace("/"), REDIRECT_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [hasHydrated, isLoggedIn, isAdmin, next, router]);

  if (!hasHydrated || !isLoggedIn) return null;
  if (isAdmin) return <>{children}</>;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-7" />
      </span>
      <h1 className="text-2xl font-bold">{t("admin.forbiddenTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("admin.forbiddenDescription")}</p>
      <Button nativeButton={false} render={<Link href="/" />}>
        {t("admin.goHome")}
      </Button>
    </div>
  );
}
