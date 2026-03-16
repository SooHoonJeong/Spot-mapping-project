import { create } from "zustand";

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isLoggedIn: false,

  setAccessToken: (token) => set({ accessToken: token, isLoggedIn: !!token }),
  setUser: (userData) => set({ user: userData }),

  logout: () => {
    set({ accessToken: null, user: null, isLoggedIn: false });
  },
}));
