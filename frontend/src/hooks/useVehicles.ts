import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const useVehicles = (
  filters: { type?: string; status?: string; region?: string; search?: string } = {},
) => {
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery<any>({
    queryKey: ['vehicles', filters],
    queryFn: () => apiClient.get('/vehicles', { params: filters }) as any,
  });

  const createVehicle = useMutation({
    mutationFn: (data: any) => apiClient.post('/vehicles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  const updateVehicle = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/vehicles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  return {
    vehiclesQuery,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
};
