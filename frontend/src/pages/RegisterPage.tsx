import { Eye, EyeOff, KeyRound, Mail, Route, User, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { apiClient } from '../lib/api-client';

const ROLES = [
  { value: 'FLEET_MANAGER', label: 'Fleet Manager', icon: '🎯', desc: 'Full platform access' },
  { value: 'DRIVER', label: 'Driver', icon: '🚗', desc: 'Trip & fuel management' },
  { value: 'SAFETY_OFFICER', label: 'Safety Officer', icon: '🛡️', desc: 'Safety & maintenance view' },
  { value: 'FINANCIAL_ANALYST', label: 'Financial Analyst', icon: '📈', desc: 'Finance & reports access' },
];

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('FLEET_MANAGER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const selectedRole = ROLES.find(r => r.value === role)!;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register', { fullName, email, password, role });
      toast.success('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error: any) {
      toast.error(error.friendlyMessage || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
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
        @keyframes slideInRight { from { opacity:0; transform: translateX(30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInLeft { from { opacity:0; transform: translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
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
          top: -50%;
          left: -60%;
          width: 40%;
          height: 200%;
          background: rgba(255,255,255,0.15);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .btn-glow:hover::after { left: 120%; }
        .btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(16,185,129,0.5);
        }
        .role-option:hover { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.3); }
        .role-option.selected { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.5); }
        .gradient-text {
          background: linear-gradient(135deg, #34d399, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Left Panel - Branding */}
      <div className="left-panel hidden lg:flex flex-col w-[45%] relative bg-[#060D13] border-r border-white/5 p-12 overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', animation: 'pulseOrb 5s ease-in-out infinite' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', animation: 'pulseOrb 5s ease-in-out infinite 2s' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-16">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
            <Route className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">TransitOps</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-black leading-tight mb-6">
            Join the future<br />of <span className="gradient-text">fleet management</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-12">
            Real-time dispatch, automated alerts, and smart analytics for logistics teams of any size.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: '⚡', text: 'Instant vehicle & driver setup' },
              { icon: '🛡️', text: 'License expiry auto-alerts' },
              { icon: '📊', text: 'Live KPIs & revenue charts' },
              { icon: '🔐', text: 'Secure role-based access control' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base flex-shrink-0">{icon}</div>
                <span className="text-white/60 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="relative z-10 mt-auto pt-8 border-t border-white/5">
          <p className="text-white/30 text-xs">Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Sign in here</button>
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="right-panel flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
            <Route className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold">TransitOps</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">Create your account</h1>
            <p className="text-white/40 text-sm">Start managing your fleet operations in seconds</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Fleet Manager"
                  className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Your Role</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm text-white flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span>{selectedRole.icon}</span>
                    <span>{selectedRole.label}</span>
                    <span className="text-white/30 text-xs">— {selectedRole.desc}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showRoleDropdown && (
                  <div className="absolute top-full mt-1 w-full rounded-xl border border-white/10 overflow-hidden z-50"
                    style={{ background: '#0D1821', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => { setRole(r.value); setShowRoleDropdown(false); }}
                        className={`role-option w-full px-4 py-3 text-left flex items-center gap-3 border-b border-white/5 last:border-0 transition-all ${role === r.value ? 'selected' : ''}`}
                      >
                        <span className="text-lg">{r.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{r.label}</div>
                          <div className="text-xs text-white/40">{r.desc}</div>
                        </div>
                        {role === r.value && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field w-full rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/20"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="input-field w-full rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/20"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-glow w-full py-3.5 rounded-xl text-white font-bold text-base mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Sign in
            </button>
          </p>

          {/* Demo note */}
          <div className="mt-6 p-3 rounded-xl border border-white/5 bg-white/2 text-center">
            <p className="text-white/25 text-xs">Demo mode: Use <span className="text-white/40 font-mono">manager@transitops.com</span> / <span className="text-white/40 font-mono">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
