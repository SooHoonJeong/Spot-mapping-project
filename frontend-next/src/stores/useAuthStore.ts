import { create } from "zustand";

interface AuthUser {
  nickname?: string;
  profileImageUrl?: string;
  [key: string]: unknown;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (userData: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isLoggedIn: false,

  setAccessToken: (token) => set({ accessToken: token, isLoggedIn: !!token }),
  setUser: (userData) => set({ user: userData }),

  logout: () => {
    set({ accessToken: null, user: null, isLoggedIn: false });
  },
}));
