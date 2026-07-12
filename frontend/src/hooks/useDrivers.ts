import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const useDrivers = (filters: { status?: string; search?: string } = {}) => {
  const queryClient = useQueryClient();

  const driversQuery = useQuery<any>({
    queryKey: ['drivers', filters],
    queryFn: () => apiClient.get('/drivers', { params: filters }) as any,
  });

  const createDriver = useMutation({
    mutationFn: (data: any) => apiClient.post('/drivers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  const updateDriver = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/drivers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  const deleteDriver = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/drivers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  return {
    driversQuery,
    createDriver,
    updateDriver,
    deleteDriver,
  };
};
