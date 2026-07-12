import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingCard: React.FC<{ children: React.ReactNode; className?: string; delay?: string }> = ({
  children,
  className = '',
  delay = '0s',
}) => (
  <div
    className={`absolute backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ${className}`}
    style={{ animation: `floatCard 6s ease-in-out infinite`, animationDelay: delay }}
  >
    {children}
  </div>
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.a})`;
        ctx.fill();
      });

      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050A0E] text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(0.5deg); }
          66% { transform: translateY(-4px) rotate(-0.5deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-title { animation: slideInLeft 0.8s ease forwards; }
        .hero-sub { animation: fadeInUp 0.8s ease 0.3s both; }
        .hero-cta { animation: fadeInUp 0.8s ease 0.5s both; }
        .hero-cards { animation: slideInRight 0.9s ease 0.2s both; }
        .glow-orb { animation: pulseGlow 4s ease-in-out infinite; }
        .scroll-indicator { animation: scrollBounce 2s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #34d399, #06b6d4, #818cf8);
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #34d399, #10b981);
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
        }
        .btn-outline {
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          border-color: rgba(52, 211, 153, 0.5);
          background: rgba(52, 211, 153, 0.05);
          transform: translateY(-2px);
        }
        .nav-btn {
          transition: all 0.2s ease;
        }
        .nav-btn:hover { color: #34d399; }
        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          border-color: rgba(52, 211, 153, 0.3);
          background: rgba(52, 211, 153, 0.05);
          transform: translateY(-3px);
        }
      `}</style>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.6 }} />

      {/* Background orbs */}
      <div className="glow-orb absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
      <div className="glow-orb absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', animationDelay: '2s' }} />
      <div className="glow-orb absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', animationDelay: '1s' }} />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">TransitOps</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="nav-btn">Features</a>
          <a href="#stats" className="nav-btn">Platform</a>
          <a href="#roles" className="nav-btn">Roles</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="nav-btn text-sm text-white/70 font-medium px-4 py-2 rounded-xl"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-xl text-white flex items-center gap-2"
          >
            Get Started <span>→</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex items-center min-h-[90vh] px-8 md:px-16 lg:px-24">
        <div className="flex-1 max-w-2xl">
          <div className="hero-title">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Fleet Operations Platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              Turn fleet chaos<br />
              into <span className="gradient-text">smart ops</span>
            </h1>
          </div>
          <p className="hero-sub text-lg md:text-xl text-white/50 leading-relaxed mb-10 max-w-lg">
            Centralized transport management — vehicles, drivers, dispatch, maintenance, and analytics — all in one command center.
          </p>
          <div className="hero-cta flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary font-semibold px-8 py-4 rounded-2xl text-white text-base flex items-center gap-2 shadow-2xl"
            >
              Get Started <span className="text-lg">→</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-outline font-semibold px-8 py-4 rounded-2xl text-white/80 text-base"
            >
              Explore Platform
            </button>
          </div>

          {/* Mini stats */}
          <div className="hero-cta flex items-center gap-6 mt-10 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-base">11+</span> Vehicles tracked
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold text-base">4</span> User roles
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-bold text-base">100%</span> Real-time
            </div>
          </div>
        </div>

        {/* Floating UI Cards */}
        <div className="hero-cards hidden lg:block flex-1 relative h-[580px] ml-8">

          {/* Main trip card */}
          <FloatingCard className="right-[60px] top-[30px] w-[280px] bg-[#0E1820]/90 p-4" delay="0s">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-full">DISPATCHED</span>
              <span className="text-[10px] text-white/40">2 min ago</span>
            </div>
            <div className="text-xs text-white/50 mb-1">TRIP PREVIEW</div>
            <div className="font-bold text-white text-base mb-2">Houston → Dallas, TX</div>
            <div className="flex gap-2 mb-3">
              {['TRUCK', 'CDL-A', 'Active'].map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">{t}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[9px] font-bold text-white">AD</div>
                <span className="text-white/60">Alex Driver</span>
              </div>
              <span className="text-emerald-400 font-semibold">390 km</span>
            </div>
          </FloatingCard>

          {/* KPI card */}
          <FloatingCard className="right-[340px] top-[10px] w-[200px] bg-[#0E1820]/90 p-4" delay="1.5s">
            <div className="text-[10px] text-white/40 mb-2">FLEET STATUS</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Available</span>
                <span className="text-xs font-bold text-emerald-400">7</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: '64%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">On Trip</span>
                <span className="text-xs font-bold text-blue-400">2</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '18%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">In Shop</span>
                <span className="text-xs font-bold text-amber-400">1</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '9%' }}></div>
              </div>
            </div>
          </FloatingCard>

          {/* Alert card */}
          <FloatingCard className="right-[40px] top-[240px] w-[260px] bg-[#0E1820]/90 p-4" delay="2.5s">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-white mb-0.5">License Expiring Soon</div>
                <div className="text-[11px] text-white/50">DL-FL-00124 expired Apr 2024</div>
                <div className="text-[10px] text-amber-400 mt-1 font-medium">Action required</div>
              </div>
            </div>
          </FloatingCard>

          {/* Revenue card */}
          <FloatingCard className="right-[310px] top-[200px] w-[200px] bg-[#0E1820]/90 p-4" delay="1s">
            <div className="text-[10px] text-white/40 mb-1">MONTHLY REVENUE</div>
            <div className="text-2xl font-black text-white mb-1">$18.2k</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +12.4% this month
            </div>
            <div className="mt-3 flex gap-1">
              {[40, 65, 45, 70, 55, 80, 60].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-emerald-500/20 relative overflow-hidden" style={{ height: '32px' }}>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-400/50 rounded-sm"
                    style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
          </FloatingCard>

          {/* Maintenance card */}
          <FloatingCard className="right-[60px] top-[450px] w-[270px] bg-[#0E1820]/90 p-3" delay="3s">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white">Maintenance Update</div>
                <div className="text-[11px] text-white/50">FL-VAN-04 — Tire & Brake check</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-semibold">ACTIVE</span>
            </div>
          </FloatingCard>

          {/* Recommended */}
          <FloatingCard className="right-[340px] top-[400px] w-[200px] bg-[#0E1820]/90 p-3" delay="2s">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold">AI INSIGHT</span>
            </div>
            <div className="text-[11px] text-white/70">Fleet utilization at <span className="text-emerald-400 font-bold">64%</span> — 3 vehicles ready for next dispatch</div>
          </FloatingCard>
        </div>
      </section>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs scroll-indicator">
        <span>Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border border-white/10 flex items-center justify-center">
          <div className="w-1 h-2 rounded-full bg-emerald-400/60"></div>
        </div>
      </div>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 px-8 md:px-16 lg:px-24 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Everything in one platform</h2>
          <p className="text-white/50 text-lg">Built for fleet managers who need speed, accuracy, and control.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { icon: '🚚', label: 'Vehicle Tracking', desc: 'Real-time status across your entire fleet' },
            { icon: '👤', label: 'Driver Management', desc: 'License alerts, safety scores & status' },
            { icon: '📍', label: 'Trip Dispatch', desc: '3-step wizard with business rule checks' },
            { icon: '🔧', label: 'Maintenance Logs', desc: 'Open/close repair records instantly' },
            { icon: '⛽', label: 'Fuel Tracking', desc: 'Log usage, cost & efficiency metrics' },
            { icon: '💰', label: 'Expense Reports', desc: 'Toll, fuel, maintenance categorized' },
            { icon: '📊', label: 'Analytics Dashboard', desc: 'KPIs, charts & ROI at a glance' },
            { icon: '🔐', label: 'Role-Based Access', desc: '4 roles: Manager, Driver, Safety, Finance' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="stat-card rounded-2xl p-5 cursor-default">
              <div className="text-2xl mb-3">{icon}</div>
              <div className="text-sm font-bold text-white mb-1">{label}</div>
              <div className="text-[12px] text-white/40 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Roles section */}
      <section id="roles" className="relative z-10 px-8 md:px-16 lg:px-24 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Built for every stakeholder</h2>
            <p className="text-white/50 text-lg">Different roles, different views — same powerful platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { role: 'Fleet Manager', color: 'from-emerald-500 to-cyan-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '🎯', perms: ['Full vehicle & driver control', 'Trip creation & dispatch', 'Analytics & reports', 'Maintenance oversight'] },
              { role: 'Driver', color: 'from-blue-500 to-violet-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '🚗', perms: ['View assigned trips', 'Log fuel consumption', 'Record trip expenses', 'Track own status'] },
              { role: 'Safety Officer', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '🛡️', perms: ['Monitor driver licenses', 'View safety scores', 'Maintenance oversight', 'Trip safety review'] },
              { role: 'Financial Analyst', color: 'from-violet-500 to-pink-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: '📈', perms: ['Expense reports & trends', 'Revenue analytics', 'Cost breakdown charts', 'CSV export'] },
            ].map(({ role, color, bg, border, icon, perms }) => (
              <div key={role} className={`${bg} border ${border} rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl`}>
                    {icon}
                  </div>
                  <h3 className="font-bold text-white text-lg">{role}</h3>
                </div>
                <ul className="space-y-2">
                  {perms.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-white/60">
                      <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative z-10 px-8 md:px-16 lg:px-24 py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Ready to launch
          </div>
          <h2 className="text-5xl font-black mb-6 leading-tight">
            Start managing your<br /><span className="gradient-text">fleet smarter</span> today
          </h2>
          <p className="text-white/50 text-lg mb-10">No setup required. Create your account and your fleet dashboard is live instantly.</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary font-bold px-10 py-4 rounded-2xl text-white text-base flex items-center gap-2 shadow-2xl"
            >
              Create Free Account <span>→</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-outline font-semibold px-8 py-4 rounded-2xl text-white/70 text-base"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <span className="font-bold text-white/60">TransitOps</span> — Smart Transport Operations Platform
        </div>
        <div className="text-white/20 text-xs">Built for the hackathon · All rights reserved</div>
      </footer>
    </div>
  );
};

export default LandingPage;
