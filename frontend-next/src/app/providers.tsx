"use client";

import { useEffect } from "react";
import Navbar from "@/features/auth/components/Navbar";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/features/auth/services/authService";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

// TODO: BUG (pre-existing, preserved as-is from frontend/src/App.jsx): `API` is not
// imported/defined anywhere in this file — this `declare` only exists to let TypeScript
// compile while keeping the exact original runtime behavior: a ReferenceError is thrown and
// silently swallowed by the catch block below. "refresh API 주소" is also a placeholder
// string, not a real endpoint. Left unfixed per migration parity requirements.
declare const API: { post: (url: string) => Promise<any> };

export default function Providers({ children }: { children: React.ReactNode }) {
  const { setAccessToken, setUser } = useAuthStore();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await API.post("refresh API 주소");
        setAccessToken(response.data.accessToken);

        const userRes = await authService.getProfile();
        setUser(userRes);
      } catch (err) {
        console.log("로그인 상태가 아닙니다.");
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <LanguageProvider>
      <Navbar />
      {children}
    </LanguageProvider>
  );
}
