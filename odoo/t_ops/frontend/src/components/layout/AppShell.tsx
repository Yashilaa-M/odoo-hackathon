import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background bg-surface-grid text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-transparent p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
