import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleDollarSign, Fuel, Plus, Wallet, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { SkeletonTable } from '../components/common/SkeletonCard';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../store/auth.store';

export const FinancePage: React.FC = () => {
  const { user } = useAuthStore();
  const hasWriteAccess = user?.role === 'FINANCIAL_ANALYST' || user?.role === 'FLEET_MANAGER';
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'EXPENSES' | 'FUEL'>('EXPENSES');

  // Fetch Expenses
  const { data: expenses, isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ['expenses'],
    queryFn: () => apiClient.get('/expenses'),
  });

  // Fetch Fuel Logs
  const { data: fuelLogs, isLoading: fuelLoading } = useQuery<any[]>({
    queryKey: ['fuel-logs'],
    queryFn: () => apiClient.get('/fuel-logs'),
  });

  // Fetch all vehicles (for selectors)
  const { data: vehicles } = useQuery<any[]>({
    queryKey: ['finance-vehicles-lookup'],
    queryFn: () => apiClient.get('/vehicles'),
  });

  // Fetch all DISPATCHED trips (to link fuel/expenses optionally)
  const { data: activeTrips } = useQuery<any[]>({
    queryKey: ['finance-trips-lookup'],
    queryFn: () => apiClient.get('/trips', { params: { status: 'DISPATCHED' } }),
  });

  // Mutations
  const logExpense = useMutation({
    mutationFn: (data: any) => apiClient.post('/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('Expense transaction logged successfully.');
    },
    onError: (err: any) => {
      toast.error(err.friendlyMessage || 'Failed to record expense.');
    },
  });

  const logFuel = useMutation({
    mutationFn: (data: any) => apiClient.post('/fuel-logs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('Fuel purchase and cost expense synchronized.');
    },
    onError: (err: any) => {
      toast.error(err.friendlyMessage || 'Failed to record purchase.');
    },
  });

  // Modal forms states
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    tripId: '',
    category: 'TOLL',
    amount: '',
    description: '',
    incurredDate: new Date().toISOString().split('T')[0],
  });

  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState({
    vehicleId: '',
    tripId: '',
    liters: '',
    cost: '',
    loggedDate: new Date().toISOString().split('T')[0],
  });

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseForm.amount);

    if (!expenseForm.vehicleId || !expenseForm.incurredDate || isNaN(amt) || amt <= 0) {
      toast.error('Please enter valid required fields.');
      return;
    }

    logExpense.mutate(
      {
        vehicleId: expenseForm.vehicleId,
        tripId: expenseForm.tripId || undefined,
        category: expenseForm.category,
        amount: amt,
        description: expenseForm.description || undefined,
        incurredDate: expenseForm.incurredDate,
      },
      {
        onSuccess: () => {
          setExpenseModalOpen(false);
          setExpenseForm({
            vehicleId: '',
            tripId: '',
            category: 'TOLL',
            amount: '',
            description: '',
            incurredDate: new Date().toISOString().split('T')[0],
          });
        },
      },
    );
  };

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lts = parseFloat(fuelForm.liters);
    const cst = parseFloat(fuelForm.cost);

    if (!fuelForm.vehicleId || !fuelForm.loggedDate || isNaN(lts) || isNaN(cst) || lts <= 0 || cst <= 0) {
      toast.error('Please enter valid fuel volumes and costs.');
      return;
    }

    logFuel.mutate(
      {
        vehicleId: fuelForm.vehicleId,
        tripId: fuelForm.tripId || undefined,
        liters: lts,
        cost: cst,
        loggedDate: fuelForm.loggedDate,
      },
      {
        onSuccess: () => {
          setFuelModalOpen(false);
          setFuelForm({
            vehicleId: '',
            tripId: '',
            liters: '',
            cost: '',
            loggedDate: new Date().toISOString().split('T')[0],
          });
        },
      },
    );
  };

  const isLoading = expensesLoading || fuelLoading;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Operational Finance</h1>
          <p className="text-sm text-muted-foreground">Log fuel metrics, highway tolls, parking and repairs.</p>
        </div>
        {hasWriteAccess && (
          <div className="flex gap-3">
            <button
              onClick={() => setFuelModalOpen(true)}
              className="bg-secondary hover:bg-secondary/80 border border-border text-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200"
            >
              <Fuel className="h-4 w-4 text-primary" /> Log Fuel Purchase
            </button>
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow transition-all duration-200"
            >
              <Plus className="h-4 w-4" /> Record General Expense
            </button>
          </div>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border text-sm">
        <button
          onClick={() => setActiveTab('EXPENSES')}
          className={`px-4 py-2.5 font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'EXPENSES'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          General Expense Ledger ({activeTab === 'EXPENSES' ? expenses?.length || 0 : '...'})
        </button>
        <button
          onClick={() => setActiveTab('FUEL')}
          className={`px-4 py-2.5 font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'FUEL'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Fuel Log Telemetry
        </button>
      </div>

      {/* Lists content */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable />
        ) : activeTab === 'EXPENSES' ? (
          /* General Expenses Table */
          !expenses || expenses.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <CircleDollarSign className="h-8 w-8 text-muted-foreground/60" /> No logged expenses found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Amount ($)</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Incurred Date</th>
                    <th className="p-4">Associated Trip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((e: any) => (
                    <tr key={e.id} className="hover:bg-secondary/15 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{e.vehicle.nameModel}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{e.vehicle.registrationNumber}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-full border border-border/20 ${
                            e.category === 'MAINTENANCE'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                              : e.category === 'FUEL'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                                : e.category === 'TOLL'
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-950/40 dark:text-gray-400'
                          }`}
                        >
                          {e.category}
                        </span>
                      </td>
                      <td className="p-4 text-foreground font-semibold">${Number(e.amount).toFixed(2)}</td>
                      <td className="p-4 text-muted-foreground text-xs max-w-xs truncate" title={e.description}>
                        {e.description || 'N/A'}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {new Date(e.incurredDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {e.trip ? `${e.trip.source} → ${e.trip.destination}` : 'Overall Fleet'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Fuel Logs Table */
          !fuelLogs || fuelLogs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <Fuel className="h-8 w-8 text-muted-foreground/60" /> No fuel logs registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Volume (Liters)</th>
                    <th className="p-4">Cost ($)</th>
                    <th className="p-4">Avg. Price ($/L)</th>
                    <th className="p-4">Logged Date</th>
                    <th className="p-4">Associated Trip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fuelLogs.map((f: any) => {
                    const pricePerLiter = Number(f.cost) / Number(f.liters);
                    return (
                      <tr key={f.id} className="hover:bg-secondary/15 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{f.vehicle.nameModel}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{f.vehicle.registrationNumber}</div>
                        </td>
                        <td className="p-4 text-foreground font-semibold">{f.liters} L</td>
                        <td className="p-4 text-foreground font-semibold">${Number(f.cost).toFixed(2)}</td>
                        <td className="p-4 text-muted-foreground text-xs">${pricePerLiter.toFixed(2)}/L</td>
                        <td className="p-4 text-muted-foreground text-xs">
                          {new Date(f.loggedDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">
                          {f.trip ? `${f.trip.source} → ${f.trip.destination}` : 'Unassigned'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Record Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#161C2A] text-white border border-[#232D42] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
              <h2 className="text-md font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Log General Expense
              </h2>
              <button
                onClick={() => setExpenseModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Vehicle *</label>
                  <select
                    required
                    value={expenseForm.vehicleId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Select --</option>
                    {vehicles?.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} ({v.nameModel})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="TOLL">Highway Toll</option>
                    <option value="FUEL">Fuel (Manual Override)</option>
                    <option value="MAINTENANCE">Maintenance (Manual Override)</option>
                    <option value="OTHER">Other Fees</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Linked Active Trip</label>
                  <select
                    value={expenseForm.tripId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">-- None (Fleet Overall) --</option>
                    {activeTrips?.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.source} → {t.destination}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Incurred Date *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.incurredDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, incurredDate: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Description / Memo</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Highway tolls for Chicago run"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232D42]">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Fuel Modal */}
      {fuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#161C2A] text-white border border-[#232D42] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
              <h2 className="text-md font-bold flex items-center gap-2">
                <Fuel className="h-5 w-5 text-primary" /> Log Fuel Dispensation
              </h2>
              <button
                onClick={() => setFuelModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFuelSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Vehicle *</label>
                  <select
                    required
                    value={fuelForm.vehicleId}
                    onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Select --</option>
                    {vehicles?.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} ({v.nameModel})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Linked Dispatched Trip</label>
                  <select
                    value={fuelForm.tripId}
                    onChange={(e) => setFuelForm({ ...fuelForm, tripId: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">-- None (Refill) --</option>
                    {activeTrips?.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.source} → {t.destination}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Liters Dispensed *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Bill Cost ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 72.50"
                    value={fuelForm.cost}
                    onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Refill Date *</label>
                <input
                  type="date"
                  required
                  value={fuelForm.loggedDate}
                  onChange={(e) => setFuelForm({ ...fuelForm, loggedDate: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232D42]">
                <button
                  type="button"
                  onClick={() => setFuelModalOpen(false)}
                  className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
                >
                  Confirm Refill Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
