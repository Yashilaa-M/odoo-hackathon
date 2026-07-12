import { LogOut, Moon, Sun, User } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';

export const Topbar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-transit-surface1/80 px-4 backdrop-blur md:px-6">
      <div>
        <h2 className="text-md font-semibold text-foreground">Fleet Control Center</h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full border border-border bg-transit-surface2/80 p-2 text-transit-text-secondary transition-colors hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {user && (
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-foreground">{user.fullName}</span>
              <span className="text-[10px] text-muted-foreground">{user.email}</span>
            </div>
            <div className="rounded-full border border-border bg-transit-surface2 p-2">
              <User className="h-4 w-4 text-transit-text-secondary" />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="rounded-full p-2 text-destructive transition-colors hover:bg-destructive/10"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
