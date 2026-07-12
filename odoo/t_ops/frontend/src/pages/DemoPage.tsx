import React, { useMemo, useState } from 'react';
import { Award, Rocket, ShieldCheck, Truck } from 'lucide-react';
import { ResponsiveTable } from '../components/composed/ResponsiveTable';
import { AchievementBadge } from '../components/ui/AchievementBadge';
import { AnimatedRing } from '../components/ui/AnimatedRing';
import { CapacityTube } from '../components/ui/CapacityTube';
import { EligibilitySelect } from '../components/ui/EligibilitySelect';
import { GlassCard } from '../components/ui/GlassCard';
import { KPICard } from '../components/ui/KPICard';
import { LiveDot } from '../components/ui/LiveDot';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { RouteMapDot } from '../components/ui/RouteMapDot';
import { StatusPill } from '../components/ui/StatusPill';
import { useToast } from '../components/ui/Toast';

const demoRows = [
  { id: 'VH-102', unit: 'Atlas 9', driver: 'Arjun Patel', status: 'AVAILABLE', load: '2.8t / 5t' },
  { id: 'VH-344', unit: 'Relay 4', driver: 'Meera Singh', status: 'ON_TRIP', load: '4.7t / 5t' },
  { id: 'VH-221', unit: 'Nimbus 1', driver: 'Ishaan Rao', status: 'IN_SHOP', load: '0t / 6t' },
] as const;

export const DemoPage: React.FC = () => {
  const { pushToast } = useToast();
  const [selectedDriver, setSelectedDriver] = useState<string | undefined>('driver-1');
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const driverOptions = useMemo(
    () => [
      { value: 'driver-1', label: 'Arjun Patel', description: 'Hazmat certified, 98 safety score' },
      { value: 'driver-2', label: 'Meera Singh', description: 'Already assigned to Trip TR-18' },
      { value: 'driver-3', label: 'Riya Khanna', description: 'License expires in 4 days' },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-transit-text-secondary">TransitOps Demo</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Living Style Guide</h1>
          <p className="mt-2 max-w-2xl text-sm text-transit-text-secondary">
            Shared primitives, status language, motion, and responsive table behavior in both dashboard and utility states.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            pushToast({
              variant: 'success',
              title: 'Dispatch window live',
              message: 'The fleet operations toast stack is wired and ready for app events.',
            })
          }
          className="rounded-2xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-white shadow-glow-active"
        >
          Trigger Toast
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Fleet Utilization" value={78} suffix="%" trend="+6.1%" sparklineData={[54, 62, 58, 65, 72, 78]} />
        <KPICard title="Trips In Flight" value={18} trend="+3 live" sparklineData={[9, 11, 10, 13, 16, 18]} glowIntensity={0.18} />
        <KPICard title="Driver Safety" value={96} suffix="%" trend="+1.2%" sparklineData={[88, 90, 91, 93, 94, 96]} />
        <KPICard title="Fuel Delta" value={12} suffix="%" trend="-2.3%" sparklineData={[18, 17, 16, 15, 14, 12]} glowIntensity={0.16} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <GlassCard className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Status Language</h2>
            <div className="flex flex-wrap gap-3">
              <StatusPill status="AVAILABLE" />
              <StatusPill status="ON_TRIP" />
              <StatusPill status="IN_SHOP" />
              <StatusPill status="SUSPENDED" />
              <StatusPill status="RETIRED" />
            </div>
            <div className="flex items-center gap-3 text-sm text-transit-text-secondary">
              <LiveDot status="ON_TRIP" />
              Route sync active
            </div>
            <EligibilitySelect
              options={driverOptions}
              value={selectedDriver}
              onChange={setSelectedDriver}
              isEligible={(option) => option.value === 'driver-1'}
              reasonIfIneligible={(option) =>
                option.value === 'driver-2' ? 'Already on an active trip.' : option.value === 'driver-3' ? 'License expires too soon.' : undefined
              }
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-6">
            <AnimatedRing value={82} label="Hero Utilization Dial" size="large" />
          </div>
        </GlassCard>

        <GlassCard className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Motion Primitives</h2>
            <button type="button" onClick={() => setModalOpen(true)} className="rounded-xl border border-border px-3 py-2 text-sm">
              Open Modal
            </button>
          </div>
          <CapacityTube current={4700} max={5000} orientation="horizontal" />
          <RouteMapDot progress={0.58} className="w-full" />
          <button type="button" onClick={() => setDrawerOpen(true)} className="rounded-xl border border-border px-3 py-2 text-sm">
            Open Drawer
          </button>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AchievementBadge title="Zero Downtime" description="Keep all critical vehicles road-ready for 30 days." icon={<ShieldCheck className="h-6 w-6 text-cyan-300" />} unlocked />
        <AchievementBadge title="Dispatch Master" description="Launch 100 successful trips without a cancellation." icon={<Rocket className="h-6 w-6 text-indigo-300" />} unlocked />
        <AchievementBadge title="Capacity Whisperer" description="Maintain under-80% overload warnings for a full week." icon={<Award className="h-6 w-6 text-slate-300" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="dark rounded-3xl border border-border bg-transit-base p-5 text-foreground">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-transit-text-secondary">Dark Tokens</p>
              <h2 className="text-lg font-semibold">Mission Control Default</h2>
            </div>
            <StatusPill status="DISPATCHED" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <KPICard title="Live Trips" value={18} trend="+3" sparklineData={[9, 12, 11, 15, 18]} />
            <GlassCard glowStatus="ON_TRIP">
              <div className="flex items-center gap-3 text-sm text-transit-text-secondary">
                <LiveDot status="ON_TRIP" />
                Active telemetry stream
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="light rounded-3xl border border-border bg-transit-base p-5 text-foreground">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-transit-text-secondary">Light Tokens</p>
              <h2 className="text-lg font-semibold">Operations Review</h2>
            </div>
            <StatusPill status="COMPLETED" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <KPICard title="Completed Trips" value={42} trend="+8" sparklineData={[21, 27, 31, 38, 42]} />
            <GlassCard glowStatus="COMPLETED">
              <CapacityTube current={3200} max={5000} orientation="horizontal" />
            </GlassCard>
          </div>
        </section>
      </div>

      <ResponsiveTable
        columns={[
          { id: 'unit', header: 'Unit', accessor: (row) => row.unit },
          { id: 'driver', header: 'Driver', accessor: (row) => row.driver },
          { id: 'status', header: 'Status', accessor: (row) => <StatusPill status={row.status} />, sortValue: (row) => row.status },
          { id: 'load', header: 'Load', accessor: (row) => row.load },
        ]}
        data={demoRows.slice()}
        sortable
        getRowId={(row) => row.id}
        renderCard={(row) => (
          <GlassCard className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{row.unit}</div>
                <div className="text-sm text-transit-text-secondary">{row.driver}</div>
              </div>
              <StatusPill status={row.status} />
            </div>
            <div className="text-sm text-transit-text-secondary">{row.load}</div>
          </GlassCard>
        )}
      />

      <Modal open={modalOpen} title="Dispatch Confirmation" onClose={() => setModalOpen(false)}>
        <p className="text-sm text-transit-text-secondary">
          Modal and drawer primitives now share the same glass surface styling and motion language.
        </p>
      </Modal>
      <Drawer open={drawerOpen} title="Vehicle Diagnostics" onClose={() => setDrawerOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-cyan-300" />
            <div>
              <div className="font-semibold text-foreground">Atlas 9</div>
              <div className="text-sm text-transit-text-secondary">Battery thermal profile nominal.</div>
            </div>
          </div>
          <CapacityTube current={5200} max={5000} />
        </div>
      </Drawer>
    </div>
  );
};
