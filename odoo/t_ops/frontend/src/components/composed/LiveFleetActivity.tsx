import { useState, useEffect, useMemo } from 'react';
import { Activity, Radio, Play, Pause, AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import { LiveDot } from '../ui/LiveDot';
import { StatusPill } from '../ui/StatusPill';
import { AnimatedRing } from '../ui/AnimatedRing';
import { CapacityTube } from '../ui/CapacityTube';
import { CountUpNumber } from '../ui/CountUpNumber';
import { useToast } from '../ui/Toast';

export interface LiveFleetActivityProps {
  compact?: boolean;
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

// Cubic Bezier path parameters matching the SVG path shapes
const routes: Point[][] = [
  // Route 0 (Nairobi to Alexandria)
  [
    { x: 25, y: 45 },
    { x: 39, y: 18 },
    { x: 58, y: 15 },
    { x: 76, y: 31 }
  ],
  // Route 1 (Casablanca to Mombasa)
  [
    { x: 27, y: 56 },
    { x: 45, y: 49 },
    { x: 63, y: 51 },
    { x: 82, y: 60 }
  ],
  // Route 2 (Lagos to Khartoum)
  [
    { x: 16, y: 74 },
    { x: 36, y: 52 },
    { x: 47, y: 43 },
    { x: 66, y: 40 }
  ]
];

const cities = [
  { name: 'Accra', x: 8, y: 82 },
  { name: 'Lagos', x: 15, y: 74 },
  { name: 'Casablanca', x: 27, y: 56 },
  { name: 'Nairobi', x: 25, y: 45 },
  { name: 'Cairo', x: 52, y: 24 },
  { name: 'Rabat', x: 48, y: 54 },
  { name: 'Khartoum', x: 66, y: 40 },
  { name: 'Alexandria', x: 78, y: 31 },
  { name: 'Mombasa', x: 82, y: 60 },
];

interface SimulatedVehicle {
  id: string;
  driver: string;
  status: 'ON_TRIP' | 'AVAILABLE' | 'IN_SHOP' | 'RETIRED' | 'SUSPENDED';
  routeIndex: number;
  direction: 1 | -1;
  t: number;
  baseSpeed: number;
  currentSpeed: number;
  rpm: number;
  load: number;
  maxLoad: number;
  safetyScore: number;
  fuelLevel: number;
  anomalies: string[];
  history: number[];
}

// Cubic Bezier interpolation: B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
function getCubicBezierPoint(t: number, points: Point[]): Point {
  const [p0, p1, p2, p3] = points;
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

  return { x, y };
}

// Derivative B'(t) to get tangent vector for heading/rotation
function getCubicBezierTangent(t: number, points: Point[]): number {
  const [p0, p1, p2, p3] = points;
  const u = 1 - t;
  const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

export function LiveFleetActivity({ compact = false, className = '' }: LiveFleetActivityProps) {
  const { pushToast } = useToast();
  
  // Simulation Controls State
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 5>(1);
  const [alertFeed, setAlertFeed] = useState<{ id: string; msg: string; time: string; level: 'info' | 'warn' | 'crit' }[]>([
    { id: '1', msg: 'TRK-047 fuel efficiency optimal.', time: '1m ago', level: 'info' },
    { id: '2', msg: 'VAN-012 cargo weight stabilized.', time: '3m ago', level: 'info' }
  ]);

  // Simulated Vehicles State
  const [vehicles, setVehicles] = useState<SimulatedVehicle[]>([
    {
      id: 'TRK-047',
      driver: 'Arjun Patel',
      status: 'ON_TRIP',
      routeIndex: 0,
      direction: 1,
      t: 0.35,
      baseSpeed: 78,
      currentSpeed: 78,
      rpm: 1450,
      load: 4.2,
      maxLoad: 5.0,
      safetyScore: 96,
      fuelLevel: 82,
      anomalies: [],
      history: Array.from({ length: 20 }, () => 70 + Math.random() * 10),
    },
    {
      id: 'VAN-012',
      driver: 'Meera Singh',
      status: 'ON_TRIP',
      routeIndex: 1,
      direction: 1,
      t: 0.12,
      baseSpeed: 94,
      currentSpeed: 94,
      rpm: 1820,
      load: 1.8,
      maxLoad: 3.0,
      safetyScore: 98,
      fuelLevel: 75,
      anomalies: [],
      history: Array.from({ length: 20 }, () => 88 + Math.random() * 8),
    },
    {
      id: 'TRK-022',
      driver: 'Riya Khanna',
      status: 'AVAILABLE',
      routeIndex: 2,
      direction: 1,
      t: 0.0, // Parked at Lagos
      baseSpeed: 0,
      currentSpeed: 0,
      rpm: 0,
      load: 0,
      maxLoad: 5.0,
      safetyScore: 92,
      fuelLevel: 94,
      anomalies: [],
      history: Array.from({ length: 20 }, () => 0),
    }
  ]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('TRK-047');
  const selectedVehicle = useMemo(() => 
    vehicles.find(v => v.id === selectedVehicleId) || vehicles[0]
  , [vehicles, selectedVehicleId]);

  // Dispatch mock trip
  const handleDispatchNew = () => {
    const isAlreadyDispatched = vehicles.some(v => v.id === 'TRK-099');
    if (isAlreadyDispatched) {
      pushToast({
        variant: 'info',
        title: 'Route Busy',
        message: 'TRK-099 is already in flight along the Lagos-Khartoum transit route.',
      });
      return;
    }

    const newVehicle: SimulatedVehicle = {
      id: 'TRK-099',
      driver: 'David Vance',
      status: 'ON_TRIP',
      routeIndex: 2,
      direction: 1,
      t: 0.0,
      baseSpeed: 82,
      currentSpeed: 82,
      rpm: 1550,
      load: 3.8,
      maxLoad: 5.5,
      safetyScore: 95,
      fuelLevel: 100,
      anomalies: [],
      history: Array.from({ length: 20 }, () => 80),
    };

    setVehicles(prev => [...prev, newVehicle]);
    setAlertFeed(prev => [
      { id: Date.now().toString(), msg: 'TRK-099 dispatched (Lagos → Khartoum)', time: 'Just now', level: 'info' },
      ...prev.slice(0, 4)
    ]);
    pushToast({
      variant: 'success',
      title: 'Mock Trip Dispatched',
      message: 'TRK-099 launched. Driver David Vance cleared. Telemetry active.',
    });
    setSelectedVehicleId('TRK-099');
  };

  // Simulate critical alarm anomaly
  const handleTriggerAnomaly = () => {
    if (!selectedVehicle || selectedVehicle.status !== 'ON_TRIP') {
      pushToast({
        variant: 'warning',
        title: 'Action Unavailable',
        message: 'Anomaly simulation requires an active ON_TRIP vehicle.',
      });
      return;
    }

    setVehicles(prev => prev.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          status: 'SUSPENDED',
          baseSpeed: 0,
          currentSpeed: 0,
          rpm: 0,
          anomalies: ['Critical Engine Coolant Temperature Overheat'],
        };
      }
      return v;
    }));

    setAlertFeed(prev => [
      { id: Date.now().toString(), msg: `CRITICAL: ${selectedVehicle.id} engine temp overheat!`, time: 'Just now', level: 'crit' },
      ...prev.slice(0, 4)
    ]);

    pushToast({
      variant: 'error',
      title: 'CRITICAL ANOMALY ALARM',
      message: `Emergency shut-down on ${selectedVehicle.id}. Driver ${selectedVehicle.driver} reporting coolant leak.`,
    });
  };

  // Reset simulation states
  const handleResetSimulation = () => {
    setVehicles([
      {
        id: 'TRK-047',
        driver: 'Arjun Patel',
        status: 'ON_TRIP',
        routeIndex: 0,
        direction: 1,
        t: 0.35,
        baseSpeed: 78,
        currentSpeed: 78,
        rpm: 1450,
        load: 4.2,
        maxLoad: 5.0,
        safetyScore: 96,
        fuelLevel: 82,
        anomalies: [],
        history: Array.from({ length: 20 }, () => 70 + Math.random() * 10),
      },
      {
        id: 'VAN-012',
        driver: 'Meera Singh',
        status: 'ON_TRIP',
        routeIndex: 1,
        direction: 1,
        t: 0.12,
        baseSpeed: 94,
        currentSpeed: 94,
        rpm: 1820,
        load: 1.8,
        maxLoad: 3.0,
        safetyScore: 98,
        fuelLevel: 75,
        anomalies: [],
        history: Array.from({ length: 20 }, () => 88 + Math.random() * 8),
      },
      {
        id: 'TRK-022',
        driver: 'Riya Khanna',
        status: 'AVAILABLE',
        routeIndex: 2,
        direction: 1,
        t: 0.0,
        baseSpeed: 0,
        currentSpeed: 0,
        rpm: 0,
        load: 0,
        maxLoad: 5.0,
        safetyScore: 92,
        fuelLevel: 94,
        anomalies: [],
        history: Array.from({ length: 20 }, () => 0),
      }
    ]);
    setSelectedVehicleId('TRK-047');
    setAlertFeed([
      { id: '1', msg: 'Simulation reset complete.', time: 'Just now', level: 'info' }
    ]);
    pushToast({
      variant: 'info',
      title: 'Simulation Reset',
      message: 'Returned vehicles to baseline operational routes.',
    });
  };

  // Main simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setVehicles(prevVehicles =>
        prevVehicles.map(vehicle => {
          if (vehicle.status !== 'ON_TRIP') {
            // AVAILABLE / SUSPENDED vehicles stay static
            return {
              ...vehicle,
              history: [...vehicle.history.slice(1), 0]
            };
          }

          // Calculate t increment
          const dt = 0.003 * simSpeed;
          let nextT = vehicle.t + dt * vehicle.direction;
          let nextDirection = vehicle.direction;

          // Ping pong navigation along Bezier path
          if (nextT >= 1.0) {
            nextT = 1.0;
            nextDirection = -1;
          } else if (nextT <= 0.0) {
            nextT = 0.0;
            nextDirection = 1;
          }

          // Dynamic fluctuations
          const speedFluctuation = (Math.random() - 0.5) * 5;
          const currentSpeed = Math.max(
            30,
            Math.min(110, vehicle.baseSpeed + speedFluctuation)
          );
          const rpm = Math.round(
            1100 + (currentSpeed / 110) * 1100 + (Math.random() - 0.5) * 80
          );

          return {
            ...vehicle,
            t: nextT,
            direction: nextDirection,
            currentSpeed,
            rpm,
            history: [...vehicle.history.slice(1), currentSpeed],
          };
        })
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Compute actual point & rotation angle for each vehicle on map
  const vehicleMapData = useMemo(() => {
    return vehicles.map(v => {
      const pathPoints = routes[v.routeIndex];
      const pos = getCubicBezierPoint(v.t, pathPoints);
      const rawAngle = getCubicBezierTangent(v.t, pathPoints);
      const angle = rawAngle + (v.direction === -1 ? 180 : 0);
      return {
        ...v,
        pos,
        angle
      };
    });
  }, [vehicles]);

  // Generate path string for selected vehicle's speed sparkline
  const sparklinePath = useMemo(() => {
    const history = selectedVehicle.history;
    const maxVal = 120;
    const w = 240;
    const h = 50;
    
    const points = history.map((val, i) => {
      const x = i * (w / (history.length - 1));
      const y = h - (val / maxVal) * (h - 10) - 5;
      return `${x},${y}`;
    });

    const linePath = `M ${points.join(' L ')}`;
    const areaPath = `${linePath} L ${w},${h} L 0,${h} Z`;

    return { linePath, areaPath };
  }, [selectedVehicle]);

  // Count metrics for header/labels
  const activeCount = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const anomalyCount = vehicles.filter(v => v.status === 'SUSPENDED').length;

  return (
    <section className={`overflow-hidden rounded-[2.5rem] border border-border bg-transit-surface2/80 text-foreground shadow-glass backdrop-blur-xl ${className}`}>
      
      {/* Simulation Header */}
      <div className="flex flex-col gap-4 border-b border-border bg-transit-surface1/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="h-5 w-5 text-cyan-400" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.24em] text-transit-text-primary">Live Operations Control</h3>
            <p className="text-[10px] text-transit-text-secondary">Simulated Telemetry Matrix Hub</p>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-cyan-500/10 border border-cyan-400/20 px-3 py-1 font-semibold text-cyan-300">
            {activeCount} active in flight
          </span>
          {anomalyCount > 0 && (
            <span className="animate-pulse rounded-full bg-rose-500/10 border border-rose-400/20 px-3 py-1 font-semibold text-rose-400">
              {anomalyCount} Critical Warning
            </span>
          )}
          <div className="h-4 w-[1px] bg-border hidden sm:block" />
          
          {/* Controls */}
          <div className="flex items-center gap-1 rounded-xl bg-transit-surface3/80 p-1 border border-border">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`rounded-lg p-1.5 transition ${isPlaying ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-transit-text-secondary'}`}
              title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
              className="rounded-lg px-2 py-1 text-[10px] font-bold text-cyan-300 hover:bg-white/5"
              title="Toggle Speed multiplier"
            >
              {simSpeed}x
            </button>
            <button
              onClick={handleResetSimulation}
              className="rounded-lg p-1.5 text-transit-text-secondary hover:bg-white/5"
              title="Reset Simulation"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Map Left, Analytics Right */}
      <div className={`grid ${compact ? 'grid-cols-1' : 'lg:grid-cols-[1.2fr_0.8fr]'} bg-[#05060A]`}>
        
        {/* Map Panel */}
        <div className="relative overflow-hidden border-r border-border">
          {/* Grid coordinates indicator */}
          <div className="absolute left-4 top-4 pointer-events-none font-mono text-[9px] text-transit-text-muted select-none">
            [SYS_GRID: TRANSIT_HUB_AFRICA_MED]
          </div>

          <div className="relative h-[28rem] bg-[#060911]/90">
            {/* Background grid canvas style */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

            {/* SVG Roads & Vectors */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="completedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              
              {/* Route 0: Nairobi to Alexandria */}
              <path
                d="M25 45 C 39 18, 58 15, 76 31"
                fill="none"
                stroke="url(#activeGradient)"
                strokeWidth="0.8"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              />
              
              {/* Route 1: Casablanca to Mombasa */}
              <path
                d="M27 56 C 45 49, 63 51, 82 60"
                fill="none"
                stroke="url(#activeGradient)"
                strokeWidth="0.8"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
              />

              {/* Route 2: Lagos to Khartoum (Dashed Draft / Emergency route) */}
              <path
                d="M16 74 C 36 52, 47 43, 66 40"
                fill="none"
                stroke="#64748B"
                strokeWidth="0.5"
                strokeDasharray="2 3"
                className="opacity-60"
              />

              {/* Connection curves linking Alexandria and Rabat */}
              <path
                d="M76 31 C 70 24, 63 21, 56 24"
                fill="none"
                stroke="url(#completedGradient)"
                strokeWidth="0.7"
                strokeLinecap="round"
              />
            </svg>

            {/* City Nodes */}
            {cities.map((city) => (
              <div
                key={city.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
              >
                <div className="relative">
                  <span className="block h-2 w-2 rounded-full border border-cyan-400 bg-[#07111b] transition duration-300 group-hover:scale-125 group-hover:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                  <span className="absolute -inset-1 rounded-full bg-cyan-400/20 animate-ping opacity-0 group-hover:opacity-100 duration-1000" />
                </div>
                <span className="mt-1 select-none text-[8px] font-bold tracking-wider text-transit-text-muted bg-[#05060A]/80 px-1 rounded transition group-hover:text-cyan-300">
                  {city.name}
                </span>
              </div>
            ))}

            {/* Active Moving Vehicle Nodes */}
            {vehicleMapData.map((vehicle) => {
              const isSelected = vehicle.id === selectedVehicleId;
              const hasAnomaly = vehicle.anomalies.length > 0;
              const toneColor = hasAnomaly 
                ? '#FB7185' 
                : vehicle.status === 'AVAILABLE' 
                ? '#10B981' 
                : '#22D3EE';

              return (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-full transition duration-300 ${isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'}`}
                  style={{ left: `${vehicle.pos.x}%`, top: `${vehicle.pos.y}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Glowing outer aura */}
                    <span 
                      className={`absolute inline-flex h-7 w-7 rounded-full opacity-35 ${isSelected ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: toneColor, boxShadow: `0 0 14px ${toneColor}` }}
                    />
                    
                    {/* Arrow/Vehicle Heading indicator */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={toneColor}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transform: `rotate(${vehicle.angle}deg)` }}
                      className="drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]"
                    >
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>

                    {/* ID Label Tag */}
                    <span 
                      className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-black tracking-wide px-2.5 py-0.5 rounded border shadow-lg transition-colors duration-200 ${isSelected ? 'bg-gradient-primary text-white border-cyan-300' : 'bg-transit-surface2/90 text-transit-text-primary border-border hover:border-cyan-500'}`}
                    >
                      {vehicle.id}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Actions Panel */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-auto z-30">
            <button
              onClick={handleDispatchNew}
              className="flex-1 min-w-[120px] rounded-xl bg-gradient-primary p-[1px] shadow-glow-active transition duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="flex h-full w-full items-center justify-center gap-1.5 rounded-[11px] bg-transit-base px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <Zap className="h-3.5 w-3.5 text-cyan-300" />
                Dispatch TRK-099
              </div>
            </button>

            <button
              onClick={handleTriggerAnomaly}
              className="flex-1 min-w-[120px] rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-rose-300 transition duration-300 hover:bg-rose-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="flex items-center justify-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Trigger anomaly
              </span>
            </button>
          </div>
        </div>

        {/* Live Analytics Dashboard Sidebar */}
        <div className="flex flex-col border-t border-border lg:border-t-0 bg-transit-surface2/40 px-6 py-5">
          
          {/* Header Panel */}
          <div className="mb-5 flex items-start justify-between border-b border-border/60 pb-4">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-transit-text-muted">
                Focused Telemetry Stream
              </span>
              <h4 className="text-xl font-black text-white mt-1">{selectedVehicle.id}</h4>
              <p className="text-xs text-transit-text-secondary mt-0.5">Driver: {selectedVehicle.driver}</p>
            </div>
            <StatusPill status={selectedVehicle.status} />
          </div>

          {selectedVehicle.anomalies.length > 0 && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-bold">SYSTEM WARNING SHUTDOWN</p>
                <p className="mt-0.5 text-rose-400 font-mono text-[10px]">{selectedVehicle.anomalies[0]}</p>
              </div>
            </div>
          )}

          {/* Captivating Analytics Widgets */}
          <div className="space-y-5 flex-1">
            
            {/* Speedometer Gauge & Safety Ring Split */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Custom SVG speedometer dial */}
              <div className="rounded-2xl border border-border bg-transit-surface3/40 p-3.5 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-[225deg]" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(154,163,184,0.12)"
                      strokeWidth="8"
                      strokeDasharray="188 250"
                      fill="transparent"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#speedGrad)"
                      strokeWidth="8"
                      strokeDasharray={`${(selectedVehicle.currentSpeed / 120) * 188} 250`}
                      fill="transparent"
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.3s ease-out' }}
                    />
                    <defs>
                      <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22D3EE" />
                        <stop offset="100%" stopColor="#6366F1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Digital read out inside */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white mt-1">
                      <CountUpNumber value={selectedVehicle.currentSpeed} />
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-transit-text-muted">KM/H</span>
                  </div>
                </div>
                <div className="mt-1 text-[9px] font-bold text-transit-text-secondary uppercase tracking-wider">
                  Velocity Gauge
                </div>
                <div className="text-[10px] text-transit-text-muted mt-0.5 font-mono">
                  RPM: {selectedVehicle.rpm.toLocaleString()}
                </div>
              </div>

              {/* Safety Ring */}
              <div className="rounded-2xl border border-border bg-transit-surface3/40 p-3.5 flex flex-col items-center justify-center">
                <AnimatedRing value={selectedVehicle.safetyScore} label="Compliance" size="compact" className="scale-90" />
              </div>
            </div>

            {/* Cargo Load Tube */}
            <div className="rounded-2xl border border-border bg-transit-surface3/40 p-4">
              <div className="mb-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-transit-text-secondary">Cargo Load Distribution</span>
                <span className="font-bold text-white">Capacity limit</span>
              </div>
              <CapacityTube current={selectedVehicle.load} max={selectedVehicle.maxLoad} orientation="horizontal" />
            </div>

            {/* Realtime Speed sparkline chart */}
            <div className="rounded-2xl border border-border bg-transit-surface3/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-transit-text-secondary">Real-Time Speed Profile</h5>
                  <p className="text-[9px] text-transit-text-muted">Last 30 seconds interval telemetry</p>
                </div>
                <LiveDot status="ON_TRIP" pulsing={selectedVehicle.status === 'ON_TRIP'} />
              </div>
              
              <div className="relative h-16 w-full overflow-hidden bg-transit-base/50 rounded-xl border border-border/40 p-1 flex items-end">
                <svg className="w-full h-full" viewBox="0 0 240 50" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Fill Area */}
                  <path
                    d={sparklinePath.areaPath}
                    fill="url(#sparklineGrad)"
                    style={{ transition: 'd 0.3s ease-out' }}
                  />
                  
                  {/* Sparkline Line */}
                  <path
                    d={sparklinePath.linePath}
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    style={{ transition: 'd 0.3s ease-out' }}
                  />
                </svg>
                
                {selectedVehicle.status !== 'ON_TRIP' && (
                  <div className="absolute inset-0 bg-transit-surface2/60 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-bold text-transit-text-muted tracking-wider uppercase select-none">
                    Telemetry Stream Stopped
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Live Alert Feed Log */}
            <div className="rounded-2xl border border-border bg-transit-surface3/40 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-transit-text-secondary">
                <Activity className="h-3.5 w-3.5 text-cyan-300" />
                Live Hub Logs
              </div>
              <div className="space-y-2 max-h-24 overflow-y-auto pr-1 font-mono text-[9px]">
                {alertFeed.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 border-b border-border/30 pb-1.5 last:border-0 last:pb-0">
                    <span className={item.level === 'crit' ? 'text-rose-400 font-bold' : item.level === 'warn' ? 'text-amber-400' : 'text-transit-text-secondary'}>
                      {item.msg}
                    </span>
                    <span className="text-[8px] text-transit-text-muted shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}

export default LiveFleetActivity;
