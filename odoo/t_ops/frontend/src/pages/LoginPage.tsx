import { KeyRound, Mail, Route } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../store/auth.store';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response: any = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user } = response;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.fullName}!`);
      setTimeout(() => navigate('/app'), 800);
    } catch (error: any) {
      toast.error(error.friendlyMessage || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail: string) => {
    setLoading(true);
    try {
      const response: any = await apiClient.post('/auth/login', {
        email: roleEmail,
        password: 'password123',
      });
      const { accessToken, user } = response;
      setAuth(user, accessToken);
      toast.success(`Logged in as ${user.fullName}`);
      setTimeout(() => navigate('/app'), 800);
    } catch (error: any) {
      toast.error('Quick login failed. Make sure seed data is loaded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white px-4 relative overflow-hidden">
      <Toaster position="top-right" richColors />

      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-accent/10 blur-[120px]"></div>

      <div className="w-full max-w-md bg-[#161C2A] border border-[#232D42] p-8 rounded-2xl shadow-xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary/10 rounded-xl text-primary mb-2">
            <Route className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TransitOps Control</h1>
          <p className="text-sm text-gray-400">Sign in to manage smart transport operations</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/95 text-white font-medium py-2.5 rounded-lg text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#232D42]"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-widest">Demo Credentials</span>
          <div className="flex-grow border-t border-[#232D42]"></div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleQuickLogin('manager@transitops.com')}
            className="bg-[#0B0F19] border border-[#232D42] hover:border-primary/50 p-2 rounded-lg text-left transition-colors"
            disabled={loading}
          >
            <span className="font-bold block text-primary">Fleet Manager</span>
            <span className="text-[10px] text-gray-500">manager@transitops.com</span>
          </button>
          <button
            onClick={() => handleQuickLogin('driver1@transitops.com')}
            className="bg-[#0B0F19] border border-[#232D42] hover:border-primary/50 p-2 rounded-lg text-left transition-colors"
            disabled={loading}
          >
            <span className="font-bold block text-emerald-500">Driver One</span>
            <span className="text-[10px] text-gray-500">driver1@transitops.com</span>
          </button>
          <button
            onClick={() => handleQuickLogin('safety@transitops.com')}
            className="bg-[#0B0F19] border border-[#232D42] hover:border-primary/50 p-2 rounded-lg text-left transition-colors"
            disabled={loading}
          >
            <span className="font-bold block text-amber-500">Safety Officer</span>
            <span className="text-[10px] text-gray-500">safety@transitops.com</span>
          </button>
          <button
            onClick={() => handleQuickLogin('finance@transitops.com')}
            className="bg-[#0B0F19] border border-[#232D42] hover:border-primary/50 p-2 rounded-lg text-left transition-colors"
            disabled={loading}
          >
            <span className="font-bold block text-violet-500">Finance Analyst</span>
            <span className="text-[10px] text-gray-500">finance@transitops.com</span>
          </button>
        </div>
      </div>
    </div>
  );
};
