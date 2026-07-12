import { QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';
import { queryClient } from './lib/query-client';
import { router } from './router';
import { ToastProvider } from './components/ui/Toast';
import { useUiStore } from './store/ui.store';
import './styles/globals.css';

const AppBootstrap: React.FC = () => {
  useAuthBootstrap();
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <RouterProvider router={router} />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppBootstrap />
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
