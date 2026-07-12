import { useAuthStore } from '../store/auth.store';

export const useRoleGuard = (allowedRoles: string[]) => {
  const { user } = useAuthStore();
  if (!user) return false;
  return allowedRoles.includes(user.role);
};
