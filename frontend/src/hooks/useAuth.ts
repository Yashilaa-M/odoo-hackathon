import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const { setAuth, clearAuth, user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password?: string }) =>
      apiClient.post('/auth/login', credentials) as any,
    onSuccess: (data: any) => {
      setAuth(data.user, data.accessToken);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/logout') as any,
    onSuccess: () => {
      clearAuth();
      navigate('/login');
    },
  });

  return {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
  };
};
