import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ClipboardList, Plus, Wrench, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { SkeletonTable } from '../components/common/SkeletonCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../store/auth.store';

export const MaintenancePage: React.FC = () => {
  const { user } = useAuthStore();
  const isManager = user?.role === 'FLEET_MANAGER';
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'CLOSED'>('ACTIVE');

  // Fetch Maintenance Logs
  const { data: logs, isLoading } = useQuery<any[]>({
    queryKey: ['maintenance-logs', activeTab],
    queryFn: () => apiClient.get('/maintenance', { params: { status: activeTab } }),
  });

  // Fetch available vehicles pool (for opening new service ticket)
  const { data: availableVehicles } = useQuery<any[]>({
    queryKey: ['maintenance-vehicles-pool'],
    queryFn: () => apiClient.get('/vehicles', { params: { status: 'AVAILABLE' } }),
  });

  // Mutations
  const createLog = useMutation({
    mutationFn: (data: any) => apiClient.post('/maintenance', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-vehicles-pool'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('Maintenance ticket opened. Vehicle status set to IN SHOP.');
    },
    onError: (err: any) => {
      toast.error(err.friendlyMessage || 'Failed to open ticket');
    },
  });

  const closeLog = useMutation({
    mutationFn: ({ id, cost }: { id: string; cost: number }) =>
      apiClient.put(`/maintenance/${id}/close`, { cost }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Maintenance log closed. Vehicle status restored.');
    },
    onError: (err: any) => {
      toast.error(err.friendlyMessage || 'Failed to close ticket');
    },
  });

  // Modal forms states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    vehicleId: '',
    type: '',
    description: '',
    cost: '',
  });

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closingLogId, setClosingLogId] = useState<string | null>(null);
  const [closeCost, setCloseCost] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const estCost = parseFloat(createForm.cost || '0');

    if (!createForm.vehicleId || !createForm.type || isNaN(estCost)) {
      toast.error('Please enter all required fields.');
      return;
    }

    createLog.mutate(
      {
        vehicleId: createForm.vehicleId,
        type: createForm.type,
        description: createForm.description || undefined,
        cost: estCost,
      },
      {
        onSuccess: () => {
          setCreateModalOpen(false);
          setCreateForm({ vehicleId: '', type: '', description: '', cost: '' });
        },
      },
    );
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCost = parseFloat(closeCost);

    if (isNaN(finalCost) || finalCost < 0) {
      toast.error('Please enter a valid cost.');
      return;
    }

    if (closingLogId) {
      closeLog.mutate(
        { id: closingLogId, cost: finalCost },
        {
          onSuccess: () => {
            setCloseModalOpen(false);
            setCloseCost('');
            setClosingLogId(null);
          },
        },
      );
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Workshop & Maintenance</h1>
          <p className="text-sm text-muted-foreground">Manage scheduled checkups, repairs, and diagnostics.</p>
        </div>
        {isManager && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Open Maintenance Ticket
          </button>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border text-sm">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2.5 font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'ACTIVE'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Worklogs ({activeTab === 'ACTIVE' ? logs?.length || 0 : '...'})
        </button>
        <button
          onClick={() => setActiveTab('CLOSED')}
          className={`px-4 py-2.5 font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'CLOSED'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Completed Logs
        </button>
      </div>

      {/* Main List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable />
        ) : !logs || logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
            <ClipboardList className="h-8 w-8 text-muted-foreground/60" />
            No maintenance records registered in this segment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">Vehicle Details</th>
                  <th className="p-4">Service Type</th>
                  <th className="p-4">Cost ($)</th>
                  <th className="p-4">Opened Date</th>
                  {activeTab === 'CLOSED' && <th className="p-4">Closed Date</th>}
                  <th className="p-4">Status</th>
                  {isManager && activeTab === 'ACTIVE' && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{log.vehicle.nameModel}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{log.vehicle.registrationNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{log.type}</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{log.description || 'No description provided'}</p>
                    </td>
                    <td className="p-4 text-foreground font-medium">${log.cost}</td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {new Date(log.openedAt).toLocaleDateString()}
                    </td>
                    {activeTab === 'CLOSED' && (
                      <td className="p-4 text-muted-foreground text-xs">
                        {log.closedAt ? new Date(log.closedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    )}
                    <td className="p-4">
                      <StatusBadge status={log.status} />
                    </td>
                    {isManager && activeTab === 'ACTIVE' && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setClosingLogId(log.id);
                            setCloseCost(log.cost.toString());
                            setCloseModalOpen(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <Check className="h-3 w-3" /> Complete Log
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#161C2A] text-white border border-[#232D42] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
              <h2 className="text-md font-bold flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" /> Open Service Worklog
              </h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Available Vehicle *</label>
                <select
                  required
                  value={createForm.vehicleId}
                  onChange={(e) => setCreateForm({ ...createForm, vehicleId: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {availableVehicles?.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.nameModel} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500">Only vehicles currently in AVAILABLE state can go to shop.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Service Category Type *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine Check, Brake Repair"
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Brake pedal feels soft. Inspect lines and pads."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Est. Initial Cost ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 250"
                  value={createForm.cost}
                  onChange={(e) => setCreateForm({ ...createForm, cost: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232D42]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Ticket Modal */}
      {closeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#161C2A] text-white border border-[#232D42] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
              <h2 className="text-md font-bold">Complete Workshop Service</h2>
              <button
                onClick={() => setCloseModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCloseSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Final Invoiced Cost ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 280.50"
                  value={closeCost}
                  onChange={(e) => setCloseCost(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-gray-500">This will be auto-logged in Fleet Expenses.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232D42]">
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(false)}
                  className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-600/95 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
