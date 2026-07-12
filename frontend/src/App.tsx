import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './lib/query-client';
import { router } from './router';
import './styles/globals.css';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
