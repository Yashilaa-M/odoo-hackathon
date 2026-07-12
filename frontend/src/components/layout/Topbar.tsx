import { LogOut, Moon, Sun, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth.store';

export const Topbar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

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
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h2 className="text-md font-semibold text-foreground">Fleet Control Center</h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {user && (
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-foreground">{user.fullName}</span>
              <span className="text-[10px] text-muted-foreground">{user.email}</span>
            </div>
            <div className="p-2 bg-secondary rounded-full">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
