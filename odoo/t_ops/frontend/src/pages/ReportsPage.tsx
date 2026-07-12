import { useQuery } from '@tanstack/react-query';
import { Download, Fuel, Navigation, TrendingUp } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast, Toaster } from 'sonner';
import { SkeletonTable } from '../components/common/SkeletonCard';
import { apiClient } from '../lib/api-client';

export const ReportsPage: React.FC = () => {
  // Fetch reports data
  const { data: reports, isLoading } = useQuery<any>({
    queryKey: ['reports'],
    queryFn: () => apiClient.get('/reports'),
  });

  const handleExportCSV = async () => {
    try {
      // Axios request returning raw Blob data
      const csvData: any = await apiClient.get('/reports/csv', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([csvData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transitops_fleet_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV Fleet Report downloaded successfully.');
    } catch (e) {
      toast.error('Failed to stream CSV download. Check authentication.');
    }
  };

  if (isLoading) {
    return <SkeletonTable />;
  }

  const vehicles = reports?.vehicles || [];
  const fleet = reports?.fleet || { totalDistance: 0, totalFuel: 0, fuelEfficiency: 0 };

  // Prepare chart data (excluding retired vehicles to focus on active fleet ROI/costs)
  const chartData = vehicles
    .filter((v: any) => v.roi !== 0 || v.totalOperationalCost > 0)
    .map((v: any) => ({
      name: v.registrationNumber,
      roi: parseFloat((v.roi * 100).toFixed(1)),
      cost: v.totalOperationalCost,
      fuelEfficiency: v.fuelEfficiency,
    }))
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Operational Reports</h1>
          <p className="text-sm text-muted-foreground">Detailed audit of asset profitability and efficiency.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow transition-all duration-200"
        >
          <Download className="h-4 w-4" /> Export CSV Report
        </button>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-lg">
            <Navigation className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Fleet Total Distance</span>
            <span className="text-2xl font-extrabold text-foreground">{fleet.totalDistance.toLocaleString()} km</span>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-lg">
            <Fuel className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Fleet Total Fuel</span>
            <span className="text-2xl font-extrabold text-foreground">{fleet.totalFuel.toLocaleString()} L</span>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Avg. Fuel Efficiency</span>
            <span className="text-2xl font-extrabold text-foreground">{fleet.fuelEfficiency.toFixed(2)} km/L</span>
          </div>
        </div>
      </div>

      {/* Graphical reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Total Operational Costs ($)
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => `$${v}`} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI comparison */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Asset ROI Analysis (%)
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.roi >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Numerical Data Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-secondary/10">
          <h3 className="text-sm font-bold text-foreground">Fleet Audit Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Vehicle Model</th>
                <th className="p-4">Reg Number</th>
                <th className="p-4">Acquisition Cost</th>
                <th className="p-4">Distance Traveled</th>
                <th className="p-4">Fuel Consumed</th>
                <th className="p-4">Operational Cost</th>
                <th className="p-4">Revenue Generated</th>
                <th className="p-4">Fuel Efficiency</th>
                <th className="p-4">Asset ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs text-foreground font-medium">
              {vehicles.map((v: any) => (
                <tr key={v.id} className="hover:bg-secondary/15 transition-colors">
                  <td className="p-4 text-foreground font-semibold">{v.nameModel}</td>
                  <td className="p-4 font-mono">{v.registrationNumber}</td>
                  <td className="p-4">${v.acquisitionCost.toLocaleString()}</td>
                  <td className="p-4">{v.totalDistance} km</td>
                  <td className="p-4">{v.totalFuelConsumed} L</td>
                  <td className="p-4 text-destructive">${v.totalOperationalCost.toLocaleString()}</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400">${v.totalRevenue.toLocaleString()}</td>
                  <td className="p-4 font-semibold">{v.fuelEfficiency} km/L</td>
                  <td
                    className={`p-4 font-bold ${
                      v.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                    }`}
                  >
                    {(v.roi * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
