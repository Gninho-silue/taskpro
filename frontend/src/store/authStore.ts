import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserBasicDTO } from '../types';

interface AuthStore {
  token: string | null;
  user: UserBasicDTO | null;
  login: (token: string, user: UserBasicDTO) => void;
  logout: () => void;
  setUser: (user: UserBasicDTO) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'taskpro-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
