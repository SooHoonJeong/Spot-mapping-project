import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthUser {
  nickname?: string;
  profileImageUrl?: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  // localStorage rehydration happens after the initial render, so pages that redirect when
  // logged out (e.g. my-page) must wait for this to flip true before checking `isLoggedIn` —
  // otherwise a genuinely logged-in user gets bounced to /login on every page load.
  hasHydrated: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (userData: AuthUser | null) => void;
  setHasHydrated: (v: boolean) => void;
  logout: () => void;
}

// Persisted to localStorage so a page reload doesn't log the user out. This project has no
// working refresh-token endpoint (see the removed checkLoginStatus effect that used to live in
// providers.tsx), so keeping the access token in memory only meant every reload required a
// fresh login.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isLoggedIn: false,
      hasHydrated: false,

      setAccessToken: (token) => set({ accessToken: token, isLoggedIn: !!token }),
      setUser: (userData) => set({ user: userData }),
      setHasHydrated: (v) => set({ hasHydrated: v }),

      logout: () => {
        set({ accessToken: null, user: null, isLoggedIn: false });
      },
    }),
    {
      name: "spot-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
