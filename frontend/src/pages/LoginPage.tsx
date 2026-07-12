import { Eye, EyeOff, KeyRound, Mail, Route } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../store/auth.store';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter both email and password.'); return; }
    setLoading(true);
    try {
      const response: any = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user } = response;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.fullName}!`);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (error: any) {
      toast.error(error.friendlyMessage || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const handleQuickLogin = async (roleEmail: string) => {
    setLoading(true);
    try {
      const response: any = await apiClient.post('/auth/login', { email: roleEmail, password: 'password123' });
      const { accessToken, user } = response;
      setAuth(user, accessToken);
      toast.success(`Logged in as ${user.fullName}`);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch {
      toast.error('Quick login failed. Make sure seed data is loaded.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#050A0E] text-white overflow-hidden">
      <Toaster position="top-right" richColors />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes pulseOrb {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        @keyframes slideInLeft { from { opacity:0; transform: translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform: translateX(30px); } to { opacity:1; transform:translateX(0); } }
        .left-panel { animation: slideInLeft 0.7s ease forwards; }
        .right-panel { animation: slideInRight 0.7s ease forwards; }
        .input-field {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.3s ease;
        }
        .input-field:focus {
          background: rgba(16,185,129,0.05);
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
          outline: none;
        }
        .btn-glow {
          background: linear-gradient(135deg, #10b981, #059669);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-glow::after {
          content: '';
          position: absolute;
          top: -50%; left: -60%;
          width: 40%; height: 200%;
          background: rgba(255,255,255,0.15);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .btn-glow:hover::after { left: 120%; }
        .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(16,185,129,0.5); }
        .quick-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.25s ease;
        }
        .quick-card:hover {
          background: rgba(16,185,129,0.05);
          border-color: rgba(16,185,129,0.25);
          transform: translateY(-2px);
        }
        .gradient-text {
          background: linear-gradient(135deg, #34d399, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Left Panel */}
      <div className="left-panel hidden lg:flex flex-col w-[45%] relative bg-[#060D13] border-r border-white/5 p-12 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', animation: 'pulseOrb 5s ease-in-out infinite' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', animation: 'pulseOrb 5s ease-in-out infinite 2s' }} />

        <div className="relative z-10 flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
            <Route className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">TransitOps</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-black leading-tight mb-6">
            Welcome back to<br /><span className="gradient-text">your command center</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-12">
            Sign in to monitor your fleet in real-time, dispatch trips, and stay ahead of every operational challenge.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '11', label: 'Vehicles', color: 'text-emerald-400' },
              { value: '10', label: 'Drivers', color: 'text-cyan-400' },
              { value: '4', label: 'Roles', color: 'text-violet-400' },
            ].map(({ value, label, color }) => (
              <div key={label} className="rounded-xl border border-white/5 bg-white/2 p-3 text-center">
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-white/40 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-8 border-t border-white/5">
          <p className="text-white/30 text-xs">Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Register here</button>
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="right-panel flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
            <Route className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold">TransitOps</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">Sign in</h1>
            <p className="text-white/40 text-sm">Access your fleet operations dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/20"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-glow w-full py-3.5 rounded-xl text-white font-bold text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-white/25 text-xs uppercase tracking-widest">Quick Demo Access</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          {/* Quick login cards */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { email: 'manager@transitops.com', role: 'Fleet Manager', icon: '🎯', color: 'text-emerald-400' },
              { email: 'driver1@transitops.com', role: 'Driver', icon: '🚗', color: 'text-blue-400' },
              { email: 'safety@transitops.com', role: 'Safety Officer', icon: '🛡️', color: 'text-amber-400' },
              { email: 'finance@transitops.com', role: 'Finance Analyst', icon: '📈', color: 'text-violet-400' },
            ].map(({ email: e, role, icon, color }) => (
              <button
                key={e}
                onClick={() => handleQuickLogin(e)}
                disabled={loading}
                className="quick-card rounded-xl p-3 text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{icon}</span>
                  <span className={`text-xs font-bold ${color}`}>{role}</span>
                </div>
                <span className="text-[10px] text-white/30 font-mono">{e}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-white/30 text-sm mt-6">
            No account?{' '}
            <button onClick={() => navigate('/register')} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
