"use client";

import { isAdminToken } from "@/lib/jwt";
import { useAuthStore } from "@/stores/useAuthStore";

// 로그인한 사용자의 JWT `role`이 ADMIN인지. 화면 분기용이며 권한 검증은 백엔드가 한다.
export function useIsAdmin() {
  return useAuthStore((s) => s.isLoggedIn && isAdminToken(s.accessToken));
}
