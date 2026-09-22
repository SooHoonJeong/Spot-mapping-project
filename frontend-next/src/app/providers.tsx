"use client";

import Navbar from "@/features/auth/components/Navbar";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

// Login state now rehydrates on its own from localStorage (see useAuthStore's persist
// middleware), so there's no longer anything to do here on mount — this used to call a
// refresh-token endpoint that was never actually implemented (declare const API; "refresh API
// 주소" placeholder), which always threw and was silently swallowed.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Navbar />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
