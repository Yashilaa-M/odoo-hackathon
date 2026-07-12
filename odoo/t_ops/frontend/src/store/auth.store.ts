import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'FLEET_MANAGER' | 'DRIVER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthReady: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthReady: false,
  setAuth: (user, accessToken) => {
    set({ user, accessToken, isAuthReady: true });
  },
  clearAuth: () => {
    set({ user: null, accessToken: null, isAuthReady: true });
  },
}));
