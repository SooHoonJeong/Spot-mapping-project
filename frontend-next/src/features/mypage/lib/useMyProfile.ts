"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, type MyProfileResponse } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";

// Shared by the my-page dashboard and the edit-profile page: redirects to /login once we know
// for sure the user isn't logged in (waiting for the persisted auth store to rehydrate first,
// so a genuinely logged-in user isn't bounced out on every reload), then fetches the full
// profile from GET /api/members/me.
export function useMyProfile() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const setUser = useAuthStore((s) => s.setUser);

  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoggedIn) router.replace("/login");
  }, [hasHydrated, isLoggedIn, router]);

  useEffect(() => {
    if (!hasHydrated || !isLoggedIn) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    authService
      .getProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setUser(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isLoggedIn, setUser]);

  return {
    profile,
    setProfile,
    // True until we can say anything definitive: still rehydrating, or hydrated-and-logged-in
    // but the profile fetch hasn't resolved yet.
    loading: !hasHydrated || (isLoggedIn && loading),
    // True once hydration finished and the user is confirmed logged in — safe to render.
    ready: hasHydrated && isLoggedIn,
    error,
  };
}
