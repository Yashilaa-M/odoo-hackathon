import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export const useTrips = (filters: { status?: string; search?: string } = {}) => {
  const queryClient = useQueryClient();

  const tripsQuery = useQuery<any>({
    queryKey: ['trips', filters],
    queryFn: () => apiClient.get('/trips', { params: filters }) as any,
  });

  const createTrip = useMutation({
    mutationFn: (data: any) => apiClient.post('/trips', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  const dispatchTrip = useMutation({
    mutationFn: (id: string) => apiClient.put(`/trips/${id}/dispatch`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  const completeTrip = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/trips/${id}/complete`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
    },
  });

  const cancelTrip = useMutation({
    mutationFn: (id: string) => apiClient.put(`/trips/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });

  return {
    tripsQuery,
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
  };
};
