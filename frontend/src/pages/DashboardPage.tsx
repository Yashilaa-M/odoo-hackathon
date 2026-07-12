import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Route,
  ShieldAlert,
  Truck,
  UserCheck,
  Warehouse,
  Wrench,
  ZapOff,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCard } from '../components/common/KpiCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { apiClient } from '../lib/api-client';

export const DashboardPage: React.FC = () => {
  // Activate realtime listener
  useDashboardSocket();

  // Dashboard filters (spec requirement)
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');

  // Build query params for KPI filtering
  const kpiParams: Record<string, string> = {};
  if (filterType) kpiParams.type = filterType;
  if (filterStatus) kpiParams.status = filterStatus;
  if (filterRegion) kpiParams.region = filterRegion;

  // Fetch live KPIs — re-fetches whenever filters change
  const { data: kpis, isLoading: kpisLoading } = useQuery<any>({
    queryKey: ['kpis', filterType, filterStatus, filterRegion],
    queryFn: () => apiClient.get('/dashboard/kpis', { params: kpiParams }) as any,
  });

  // Fetch financial report data for Recharts & Smart Insights
  const { data: reportData, isLoading: reportsLoading } = useQuery<any>({
    queryKey: ['reports'],
    queryFn: () => apiClient.get('/reports') as any,
  });

  const isLoading = kpisLoading || reportsLoading;

  // Generate Smart Insights based on fleet statistics
  const getSmartInsights = () => {
    if (!reportData || !reportData.vehicles || reportData.vehicles.length === 0) {
      return [
        'No fleet metrics available yet. Register assets and complete dispatch trips to generate insights.',
      ];
    }

    const insights: string[] = [];
    const vehiclesList = reportData.vehicles;

    // Highest ROI vehicle
    const highestRoi = [...vehiclesList].sort((a, b) => b.roi - a.roi)[0];
    if (highestRoi && highestRoi.roi > 0) {
      insights.push(
        `High Performance: ${highestRoi.nameModel} (${highestRoi.registrationNumber}) reports the highest ROI at ${(highestRoi.roi * 100).toFixed(2)}% due to high trip revenue.`,
      );
    }

    // High cost warning
    const highestCost = [...vehiclesList].sort(
      (a, b) => b.totalOperationalCost - a.totalOperationalCost,
    )[0];
    if (highestCost && highestCost.totalOperationalCost > 0) {
      insights.push(
        `Expense Alert: ${highestCost.nameModel} (${highestCost.registrationNumber}) has accumulated $${highestCost.totalOperationalCost.toLocaleString()} in operational expenses (Fuel + Maintenance).`,
      );
    }

    // Low Fuel Efficiency warning
    const completedTripsVehicles = vehiclesList.filter((v: any) => v.totalFuelConsumed > 0);
    const lowestEfficiency = [...completedTripsVehicles].sort(
      (a, b) => a.fuelEfficiency - b.fuelEfficiency,
    )[0];
    if (lowestEfficiency && lowestEfficiency.fuelEfficiency > 0) {
      insights.push(
        `Efficiency Advisory: ${lowestEfficiency.nameModel} (${lowestEfficiency.registrationNumber}) is reporting low fuel efficiency (${lowestEfficiency.fuelEfficiency.toFixed(2)} km/L). Schedule an engine inspection.`,
      );
    }

    return insights;
  };

  const insights = getSmartInsights();

  // Prepare chart data
  const pieData = kpis
    ? [
        { name: 'Available', value: kpis.availableVehicles, color: '#10b981' },
        { name: 'On Trip', value: kpis.activeVehicles, color: '#3b82f6' },
        { name: 'In Shop', value: kpis.inShopVehicles, color: '#f59e0b' },
      ].filter((d) => d.value > 0)
    : [];

  const barData =
    reportData && reportData.vehicles
      ? reportData.vehicles
          .map((v: any) => ({
            name: v.registrationNumber,
            roi: parseFloat((v.roi * 100).toFixed(1)),
            cost: v.totalOperationalCost,
          }))
          .slice(0, 6)
      : [];

  const hasActiveFilters = filterType || filterStatus || filterRegion;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
        <div className="h-14 w-full bg-muted rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Fleet Control Center</h1>
        <p className="text-sm text-muted-foreground">Real-time telemetry and operational insights.</p>
      </div>

      {/* ── Filters bar (spec requirement) ── */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          Filter KPIs:
        </span>
        <div className="flex flex-wrap gap-3 flex-1">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Vehicle Types</option>
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="BIKE">Cargo Bike</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Workshop</option>
            <option value="RETIRED">Retired</option>
          </select>
          <input
            type="text"
            placeholder="Filter by region..."
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary w-44"
          />
          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilterType('');
                setFilterStatus('');
                setFilterRegion('');
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear filters
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
            FILTERED VIEW
          </span>
        )}
      </div>

      {/* ── KPI Grid — all 7 required KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Fleet Utilization"
          value={`${kpis?.fleetUtilization ?? 0}%`}
          icon={Truck}
          description="Active vehicles as % of total fleet"
          trend={kpis?.fleetUtilization > 30 ? 'High load' : 'Normal'}
          color="text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30"
        />
        <KpiCard
          title="Available Vehicles"
          value={kpis?.availableVehicles ?? 0}
          icon={CheckCircle2}
          description="Vehicles ready for dispatch"
          color="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30"
        />
        <KpiCard
          title="Active Vehicles"
          value={kpis?.activeVehicles ?? 0}
          icon={Truck}
          description="Vehicles currently on a trip"
          color="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30"
        />
        <KpiCard
          title="In Maintenance"
          value={kpis?.inShopVehicles ?? 0}
          icon={Wrench}
          description="Vehicles undergoing service"
          color="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30"
        />
        <KpiCard
          title="Active Trips"
          value={kpis?.activeTrips ?? 0}
          icon={Route}
          description="Trips currently dispatched"
          color="text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/30"
        />
        <KpiCard
          title="Pending Trips"
          value={kpis?.pendingTrips ?? 0}
          icon={ZapOff}
          description="Trips in DRAFT awaiting dispatch"
          color="text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30"
        />
        <KpiCard
          title="Drivers On Duty"
          value={kpis?.driversOnDuty ?? 0}
          icon={UserCheck}
          description="Available or actively on a trip"
          color="text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/30"
        />
        {/* Filler card for visual balance on 4-col grid */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4 opacity-60">
          <div className="p-3 rounded-lg bg-secondary text-muted-foreground">
            <Warehouse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fleet Health
            </p>
            <p className="text-sm font-bold text-foreground mt-1">
              {kpis?.availableVehicles > 0
                ? `${Math.round(((kpis.availableVehicles) / Math.max(kpis.availableVehicles + kpis.activeVehicles + kpis.inShopVehicles, 1)) * 100)}% Ready`
                : 'No Data'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Vehicle Status Distribution
            </h3>
            {pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                No active status segments
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 text-xs font-semibold mt-3">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span>
                  {d.name}: {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Asset Profitability (ROI %)
          </h3>
          {barData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
              No historical ROI metrics
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                    {barData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.roi >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Smart Insights & Advisories ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Insights */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Smart Fleet Insights
            </h3>
          </div>
          <ul className="space-y-3">
            {insights.map((ins, idx) => (
              <li key={idx} className="text-xs text-foreground flex items-start gap-3">
                <span className="p-1 bg-primary/10 rounded text-primary mt-0.5">🚀</span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Advisories */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Critical Advisories
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            {kpis?.pendingTrips > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/50 rounded-lg flex gap-3 text-orange-800 dark:text-orange-400">
                <Route className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Trips Awaiting Dispatch</p>
                  <p className="text-[11px] mt-0.5">
                    {kpis.pendingTrips} trip(s) in DRAFT state pending approval.
                  </p>
                </div>
              </div>
            )}
            {kpis?.inShopVehicles > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-lg flex gap-3 text-amber-800 dark:text-amber-400">
                <Wrench className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Maintenance Alert</p>
                  <p className="text-[11px] mt-0.5">
                    {kpis.inShopVehicles} vehicle(s) currently in shop. Check worklogs.
                  </p>
                </div>
              </div>
            )}
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 rounded-lg flex gap-3 text-red-800 dark:text-red-400">
              <ShieldAlert className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Compliance Review</p>
                <p className="text-[11px] mt-0.5">
                  Verify all drivers hold active licenses. Expired drivers are blocked from dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
