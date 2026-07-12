import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { socket } from '../lib/socket-client';

export const useDashboardSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.connect();

    socket.on('kpi_update_trigger', () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    });

    socket.on('vehicle_status_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    });

    socket.on('driver_status_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    });

    socket.on('trip_status_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    });

    return () => {
      socket.off('kpi_update_trigger');
      socket.off('vehicle_status_changed');
      socket.off('driver_status_changed');
      socket.off('trip_status_changed');
      socket.disconnect();
    };
  }, [queryClient]);
};
