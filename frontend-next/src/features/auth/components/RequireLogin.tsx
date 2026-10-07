"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

// 로그인이 필요한 화면을 감싼다. localStorage 복원이 끝난(hasHydrated) 뒤에도 로그인 상태가 아니면
// 로그인 페이지로 보내고, 로그인에 성공하면 원래 가려던 `next` 경로로 돌아오게 한다. 확인이 끝나기
// 전과 리다이렉트 중에는 아무것도 그리지 않아서, 로그아웃 상태의 화면이 깜빡이지 않는다.
export function RequireLogin({ next, children }: { next: string; children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [hasHydrated, isLoggedIn, next, router]);

  if (!hasHydrated || !isLoggedIn) return null;
  return <>{children}</>;
}
