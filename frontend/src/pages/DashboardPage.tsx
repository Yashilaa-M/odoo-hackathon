import { useQuery } from '@tanstack/react-query';
import { AlertCircle, HelpCircle, Route, ShieldAlert, Truck, UserCheck, Wrench } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { KpiCard } from '../components/common/KpiCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { apiClient } from '../lib/api-client';

export const DashboardPage: React.FC = () => {
  // Activate realtime listener
  useDashboardSocket();

  // Fetch live KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery<any>({
    queryKey: ['kpis'],
    queryFn: () => apiClient.get('/dashboard/kpis') as any,
  });

  // Fetch financial report data for Recharts & Smart Insights
  const { data: reportData, isLoading: reportsLoading } = useQuery<any>({
    queryKey: ['reports'],
    queryFn: () => apiClient.get('/reports') as any,
  });

  const isLoading = kpisLoading || reportsLoading;

  // 1. Generate Smart Insights based on seed statistics
  const getSmartInsights = () => {
    if (!reportData || !reportData.vehicles || reportData.vehicles.length === 0) {
      return ['No fleet metrics available yet. Register assets and complete dispatch trips to generate insights.'];
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
    const highestCost = [...vehiclesList].sort((a, b) => b.totalOperationalCost - a.totalOperationalCost)[0];
    if (highestCost && highestCost.totalOperationalCost > 0) {
      insights.push(
        `Expense Alert: ${highestCost.nameModel} (${highestCost.registrationNumber}) has accumulated $${highestCost.totalOperationalCost.toLocaleString()} in operational expenses (Fuel + Maintenance).`,
      );
    }

    // Low Fuel Efficiency warning
    const completedTripsVehicles = vehiclesList.filter((v: any) => v.totalFuelConsumed > 0);
    const lowestEfficiency = [...completedTripsVehicles].sort((a, b) => a.fuelEfficiency - b.fuelEfficiency)[0];
    if (lowestEfficiency && lowestEfficiency.fuelEfficiency > 0) {
      insights.push(
        `Efficiency Advisory: ${lowestEfficiency.nameModel} (${lowestEfficiency.registrationNumber}) is reporting low fuel efficiency (${lowestEfficiency.fuelEfficiency.toFixed(2)} km/L). Schedule an engine inspection.`,
      );
    }

    return insights;
  };

  const insights = getSmartInsights();

  // 2. Prepare charts datasets
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Fleet Control Center</h1>
        <p className="text-sm text-muted-foreground">Real-time telemetry and operational insights.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Fleet Utilization"
          value={`${kpis?.fleetUtilization || 0}%`}
          icon={Truck}
          description="Percentage of active vehicles on the road"
          trend={kpis?.fleetUtilization > 30 ? 'High load' : 'Normal'}
          color="text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30"
        />
        <KpiCard
          title="Active Trips"
          value={kpis?.activeTrips || 0}
          icon={Route}
          description="Trips currently dispatched"
          color="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30"
        />
        <KpiCard
          title="In Workshop"
          value={kpis?.inShopVehicles || 0}
          icon={Wrench}
          description="Vehicles undergoing maintenance"
          color="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30"
        />
        <KpiCard
          title="Drivers on Duty"
          value={kpis?.driversOnDuty || 0}
          icon={UserCheck}
          description="Available or active drivers"
          color="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
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
          <div className="flex justify-center gap-6 text-xs font-semibold">
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

        {/* ROI Breakdown */}
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
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                    {barData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.roi >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Smart Insights & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Insights Card */}
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

        {/* Operational Status Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Critical Advisories
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            {kpis?.inShopVehicles && kpis.inShopVehicles > 0 ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-lg flex gap-3 text-amber-800 dark:text-amber-400">
                <Wrench className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Maintenance Alert</p>
                  <p className="text-[11px] mt-0.5">
                    {kpis.inShopVehicles} vehicle(s) currently in shop. Check maintenance worklogs.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Check for expired licenses or suspended status (from reports/drivers eventually) */}
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 rounded-lg flex gap-3 text-red-800 dark:text-red-400">
              <ShieldAlert className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Compliance Review</p>
                <p className="text-[11px] mt-0.5">
                  Confirm all drivers hold active licenses. Expired drivers are blocked from scheduling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
