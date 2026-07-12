import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, CircleDollarSign, Gauge, LockKeyhole, Route, ShieldCheck, Sparkles, Truck, LineChart, Globe, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedRing } from '../components/ui/AnimatedRing';
import { CountUpNumber } from '../components/ui/CountUpNumber';
import { GlassCard } from '../components/ui/GlassCard';
import { KPICard } from '../components/ui/KPICard';
import { StatusPill } from '../components/ui/StatusPill';
import { LiveFleetActivity } from '../components/composed/LiveFleetActivity';

const performanceBars = [
  { label: 'Dispatch Precision', value: 89, color: '#22D3EE', desc: 'AI-assisted routing success rate' },
  { label: 'Fleet Utilization', value: 78, color: '#34D399', desc: 'Active vehicles relative to fleet size' },
  { label: 'Cost Minimization', value: 65, color: '#C471ED', desc: 'Fuel and maintenance savings delta' },
  { label: 'Compliance Level', value: 96, color: '#FBBF24', desc: 'Driver safety and log validity score' },
];

export const LandingPage: React.FC = () => {
  // Let the hero statistics fluctuate slightly to mimic incoming live fleet updates
  const [liveTripsCount, setLiveTripsCount] = useState(12);
  const [safetyScore, setSafetyScore] = useState(96);
  const [longestRun, setLongestRun] = useState(483);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      // Fluctuations
      setLiveTripsCount(prev => Math.max(10, Math.min(16, prev + (Math.random() > 0.5 ? 1 : -1))));
      setSafetyScore(prev => Math.max(94, Math.min(99, prev + (Math.random() > 0.6 ? 1 : -1))));
      setLongestRun(prev => prev + (Math.random() > 0.95 ? 1 : 0));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#05060A] text-white">
      {/* Visual background decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(196,113,237,0.1),transparent_35%)] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-between border-b border-white/5">
        
        {/* Navigation Header */}
        <header className="relative z-20 mx-auto w-full max-w-[1500px] px-6 py-6 sm:px-8 lg:px-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-glow-active transition-transform duration-300 group-hover:rotate-6">
              <Route className="h-6 w-6" />
            </span>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">TransitOps</span>
              <span className="block text-[8px] font-bold uppercase tracking-[0.3em] text-cyan-400">Tactical Control</span>
            </div>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-2.5 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-cyan-400/40 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-2.5 text-sm font-black text-white shadow-glow-active transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(99,102,241,0.5)]"
            >
              Launch Console <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </header>

        {/* Hero Body */}
        <div className="relative z-10 mx-auto flex-1 w-full max-w-[1500px] px-6 py-8 sm:px-8 lg:px-10 flex flex-col justify-center">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center">
            
            {/* Left Hero Content */}
            <div className="max-w-4xl space-y-8">
              
              {/* Sparkle badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
                Intelligent Fleet Telemetry
              </div>
              
              <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                Turn logistics into <span className="text-transparent bg-clip-text bg-gradient-primary">live intelligence</span>
              </h1>
              
              <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Stop looking at stale charts. Route, dispatch, track capacity limits, and monitor live vehicle safety telemetry from a single unified cockpit.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary px-8 py-4 text-base font-black text-white shadow-[0_0_34px_rgba(99,102,241,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]"
                >
                  Enter Cockpit <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#analytics"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-8 py-4 text-base font-semibold text-white/80 backdrop-blur transition hover:border-white/20 hover:text-white"
                >
                  Explore Analytics
                </a>
              </div>

              {/* Dynamic Hero counters */}
              <div className="grid grid-cols-3 gap-4 max-w-lg pt-4 border-t border-white/5">
                <GlassCard className="rounded-2xl p-4 bg-transit-surface2/50 border-white/5">
                  <div className="text-2xl font-black text-cyan-300">
                    <CountUpNumber value={liveTripsCount} />
                  </div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-transit-text-secondary">
                    Active Trips
                  </div>
                </GlassCard>
                
                <GlassCard className="rounded-2xl p-4 bg-transit-surface2/50 border-white/5">
                  <div className="text-2xl font-black text-emerald-300">
                    <CountUpNumber value={safetyScore} suffix="%" />
                  </div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-transit-text-secondary">
                    Safety Index
                  </div>
                </GlassCard>
                
                <GlassCard className="rounded-2xl p-4 bg-transit-surface2/50 border-white/5">
                  <div className="text-2xl font-black text-amber-300">
                    <CountUpNumber value={longestRun} suffix=" km" />
                  </div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-transit-text-secondary">
                    Longest Run
                  </div>
                </GlassCard>
              </div>

            </div>

            {/* Right Hero Visuals: Real-time map */}
            <div className="relative">
              <div className="absolute -right-6 -top-8 hidden rounded-3xl border border-white/10 bg-transit-surface2/70 p-4 shadow-glass backdrop-blur-xl xl:block z-20">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                  AI ROUTE OPTIMIZATION
                </div>
                <div className="text-xs font-bold text-white mt-1">Lagos - Khartoum corridor</div>
                <div className="mt-3 flex items-center gap-3">
                  <AnimatedRing value={88} label="Efficiency" />
                  <StatusPill status="DISPATCHED" label="Clear Path" />
                </div>
              </div>
              
              <LiveFleetActivity />
            </div>

          </div>
        </div>

        {/* Bottom scroll-indicator */}
        <div className="relative py-4 flex justify-center text-transit-text-secondary/50 text-xs">
          Scroll to explore data analytics cockpit
        </div>
      </section>

      {/* Advanced Analytics Grid */}
      <section id="analytics" className="relative mx-auto max-w-[1500px] px-6 py-20 sm:px-8 lg:px-10">
        
        <div className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.24em] bg-clip-text text-transparent bg-gradient-primary">
            ANALYTICS COMMAND CENTER
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2 text-white">Advanced Operations KPI Analytics</h2>
          <p className="text-sm text-transit-text-secondary mt-2 max-w-xl">
            TransitOps processes hundreds of high-frequency coordinates, compliance logs, and fuel sensor variables, rendering them into readable operational gauges.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Grid of KPI cards with mini sparklines */}
          <div className="grid gap-6 sm:grid-cols-2">
            <KPICard title="Fleet Utilization" value={78} suffix="%" trend="+6.1%" sparklineData={[48, 57, 62, 66, 71, 78]} glowIntensity={0.2} />
            <KPICard title="Revenue Per KM" value={4.25} prefix="$" decimals={2} trend="+12.4%" sparklineData={[2.8, 3.1, 3.5, 3.3, 3.9, 4.25]} glowIntensity={0.18} />
            <KPICard title="Maintenance Incidents" value={2} trend="-3" sparklineData={[8, 6, 5, 4, 3, 2]} />
            <KPICard title="Driver Compliance" value={97} suffix="%" trend="+2.8%" sparklineData={[82, 86, 88, 89, 91, 97]} />
          </div>

          {/* Interactive performance breakdowns */}
          <GlassCard className="rounded-[2.5rem] p-8 border-white/5 bg-transit-surface2/45 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">Operations Health</p>
                <h3 className="text-2xl font-black text-white mt-1">Platform Performance Scores</h3>
              </div>
              <LineChart className="h-8 w-8 text-cyan-300" />
            </div>

            <div className="space-y-6 my-8">
              {performanceBars.map((item, idx) => (
                <div 
                  key={item.label}
                  className="space-y-2 relative"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-transit-text-secondary flex items-center gap-1.5 cursor-help">
                      {item.label}
                      <HelpCircle className="h-3.5 w-3.5 text-transit-text-muted transition duration-200 hover:text-white" />
                    </span>
                    <span className="font-black text-white">{item.value}%</span>
                  </div>

                  <div className="relative h-3 overflow-hidden rounded-full bg-transit-surface3/80 border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.value}%`,
                        background: `linear-gradient(90deg, ${item.color}, color-mix(in srgb, ${item.color} 50%, white))`,
                        boxShadow: `0 0 16px color-mix(in srgb, ${item.color} 40%, transparent)`,
                      }}
                    />
                  </div>

                  {/* Captivating description tooltip */}
                  <div className={`text-[10px] text-cyan-200/90 font-mono transition-all duration-300 ${hoveredBarIndex === idx ? 'opacity-100 max-h-6 mt-1' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    ➔ {item.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-transit-surface3/40 p-4 hover:border-cyan-500/35 transition duration-300">
                <Gauge className="mb-2 h-5 w-5 text-cyan-300" />
                <div className="text-[11px] font-bold text-white uppercase tracking-wider">Predict ETAs</div>
              </div>
              <div className="rounded-2xl border border-border bg-transit-surface3/40 p-4 hover:border-emerald-500/35 transition duration-300">
                <CircleDollarSign className="mb-2 h-5 w-5 text-emerald-300" />
                <div className="text-[11px] font-bold text-white uppercase tracking-wider">Expose ROI</div>
              </div>
              <div className="rounded-2xl border border-border bg-transit-surface3/40 p-4 hover:border-amber-500/35 transition duration-300">
                <ShieldCheck className="mb-2 h-5 w-5 text-amber-300" />
                <div className="text-[11px] font-bold text-white uppercase tracking-wider">Audit Risk</div>
              </div>
            </div>

          </GlassCard>

        </div>

      </section>

      {/* Feature Spotlights Section */}
      <section className="mx-auto max-w-[1500px] px-6 pb-24 sm:px-8 lg:grid-cols-3 lg:px-10 grid gap-8">
        {[
          { icon: Truck, title: 'Vehicle intelligence', text: 'Tire safety indices, fuel efficiency graphs, capacity limits, and maintenance warnings are linked directly to your dispatch flow.' },
          { icon: Route, title: 'Trip orchestration', text: 'Ensure perfect delivery handshakes. TransitOps automatically verifies license compliance and cargo weights before dispatch clearance.' },
          { icon: LockKeyhole, title: 'Role-safe control panels', text: 'Secure Role-Based Access Control (RBAC). Drivers, safety officers, and financial analysts see only relevant telemetry controls.' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <GlassCard key={item.title} hoverLift className="rounded-[2.5rem] p-8 bg-transit-surface2/30 border-white/5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 mb-6">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-black text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-6 text-transit-text-secondary">{item.text}</p>
              
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-cyan-300 group cursor-pointer">
                <span>View specification</span>
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </GlassCard>
          );
        })}
      </section>

    </main>
  );
};

export default LandingPage;
