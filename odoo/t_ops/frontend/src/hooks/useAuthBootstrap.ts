import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const apiBaseUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export const useAuthBootstrap = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  useEffect(() => {
    if (isAuthReady) {
      return;
    }

    let isMounted = true;

    const restoreSession = async () => {
      try {
        const response = await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken, user } = response.data.data;

        if (isMounted) {
          setAuth(user, accessToken);
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, isAuthReady, setAuth]);
};
