import { Plus, Search, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { SkeletonTable } from '../components/common/SkeletonCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useVehicles } from '../hooks/useVehicles';
import { useAuthStore } from '../store/auth.store';

export const VehiclesPage: React.FC = () => {
  const { user } = useAuthStore();
  const isManager = user?.role === 'FLEET_MANAGER';

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  // Fetch data
  const { vehiclesQuery, createVehicle, updateVehicle, deleteVehicle } = useVehicles({
    search,
    type,
    status,
  });

  const { data: vehicles, isLoading } = vehiclesQuery;

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    registrationNumber: '',
    nameModel: '',
    type: 'TRUCK',
    maxLoadCapacityKg: '',
    odometerKm: '',
    acquisitionCost: '',
    region: '',
  });

  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const resetForm = () => {
    setForm({
      registrationNumber: '',
      nameModel: '',
      type: 'TRUCK',
      maxLoadCapacityKg: '',
      odometerKm: '',
      acquisitionCost: '',
      region: '',
    });
    setEditingId(null);
  };

  const handleEdit = (veh: any) => {
    setEditingId(veh.id);
    setForm({
      registrationNumber: veh.registrationNumber,
      nameModel: veh.nameModel,
      type: veh.type,
      maxLoadCapacityKg: veh.maxLoadCapacityKg.toString(),
      odometerKm: veh.odometerKm.toString(),
      acquisitionCost: veh.acquisitionCost.toString(),
      region: veh.region || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const maxLoad = parseFloat(form.maxLoadCapacityKg);
    const odometer = parseFloat(form.odometerKm || '0');
    const cost = parseFloat(form.acquisitionCost);

    if (!form.registrationNumber || !form.nameModel || isNaN(maxLoad) || isNaN(cost)) {
      toast.error('Please fill in all required fields with valid numbers.');
      return;
    }

    if (maxLoad <= 0) {
      toast.error('Capacity must be greater than 0 kg');
      return;
    }
    if (cost < 0 || odometer < 0) {
      toast.error('Cost and Odometer cannot be negative values');
      return;
    }

    const payload = {
      registrationNumber: form.registrationNumber,
      nameModel: form.nameModel,
      type: form.type,
      maxLoadCapacityKg: maxLoad,
      odometerKm: odometer,
      acquisitionCost: cost,
      region: form.region || undefined,
    };

    if (editingId) {
      updateVehicle.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success('Vehicle registry updated successfully.');
            setModalOpen(false);
            resetForm();
          },
          onError: (err: any) => {
            toast.error(err.friendlyMessage || 'Failed to update vehicle');
          },
        },
      );
    } else {
      createVehicle.mutate(payload, {
        onSuccess: () => {
          toast.success('Vehicle registered successfully.');
          setModalOpen(false);
          resetForm();
        },
        onError: (err: any) => {
          toast.error(err.friendlyMessage || 'Failed to create vehicle');
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove or archive this vehicle?')) {
      deleteVehicle.mutate(id, {
        onSuccess: (res: any) => {
          toast.success(res.message || 'Vehicle processed successfully');
          if (selectedVehicle?.id === id) setSelectedVehicle(null);
        },
        onError: (err: any) => {
          toast.error(err.friendlyMessage || 'Failed to delete vehicle');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vehicle Registry</h1>
          <p className="text-sm text-muted-foreground">Manage and track company transport assets.</p>
        </div>
        {isManager && (
          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Register Vehicle
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by registration or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-3 text-sm">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="BIKE">Cargo Bike</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Workshop</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </div>

      {/* Main Grid: list + side drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table / List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <SkeletonTable />
          ) : !vehicles || vehicles.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No vehicles found matching filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4">Registration</th>
                    <th className="p-4">Model/Type</th>
                    <th className="p-4">Capacity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vehicles.map((v: any) => (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVehicle(v)}
                      className={`hover:bg-secondary/25 transition-colors cursor-pointer ${
                        selectedVehicle?.id === v.id ? 'bg-secondary/40 font-medium' : ''
                      }`}
                    >
                      <td className="p-4 text-foreground font-semibold">{v.registrationNumber}</td>
                      <td className="p-4">
                        <div className="text-foreground">{v.nameModel}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{v.type}</div>
                      </td>
                      <td className="p-4 text-muted-foreground">{v.maxLoadCapacityKg} kg</td>
                      <td className="p-4">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {isManager && (
                          <>
                            <button
                              onClick={() => handleEdit(v)}
                              className="text-primary hover:text-primary/80 font-medium text-xs bg-primary/10 px-2.5 py-1 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="text-destructive hover:text-destructive/80 font-medium text-xs bg-destructive/10 p-1 rounded"
                              title="Delete or Retire vehicle"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Vehicle Drawer */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-md font-bold text-foreground">Asset Telemetry</h3>
            <p className="text-xs text-muted-foreground">Select a vehicle to view logs and configurations.</p>
          </div>

          {selectedVehicle ? (
            <div className="space-y-6 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-foreground">{selectedVehicle.registrationNumber}</span>
                <StatusBadge status={selectedVehicle.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-b border-border pb-4">
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Model</span>
                  <span className="text-foreground font-semibold">{selectedVehicle.nameModel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Class Type</span>
                  <span className="text-foreground font-semibold uppercase">{selectedVehicle.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Odometer</span>
                  <span className="text-foreground font-semibold">{selectedVehicle.odometerKm} km</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Capacity</span>
                  <span className="text-foreground font-semibold">{selectedVehicle.maxLoadCapacityKg} kg</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Region</span>
                  <span className="text-foreground font-semibold">{selectedVehicle.region || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Purchase Cost</span>
                  <span className="text-foreground font-semibold">${Number(selectedVehicle.acquisitionCost).toLocaleString()}</span>
                </div>
              </div>

              {/* Maintenance History */}
              <div className="space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Recent Maintenance</h4>
                {selectedVehicle.maintenanceLogs && selectedVehicle.maintenanceLogs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedVehicle.maintenanceLogs.map((log: any) => (
                      <div key={log.id} className="p-3 bg-secondary/35 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>{log.type}</span>
                          <span className="text-muted-foreground">${log.cost}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{log.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No historical service worklogs.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-muted-foreground italic">
              No vehicle selected. Click on a table row.
            </div>
          )}
        </div>
      </div>

      {/* Scaffolding Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#161C2A] text-white border border-[#232D42] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
              <h2 className="text-md font-bold">
                {editingId ? 'Modify Fleet Asset' : 'Register New Fleet Asset'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#232D42]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Plate Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TX-TRK-90"
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Class Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="TRUCK">Truck</option>
                    <option value="VAN">Van</option>
                    <option value="BIKE">Cargo Bike</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ford Transit 2024"
                  value={form.nameModel}
                  onChange={(e) => setForm({ ...form, nameModel: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Load Capacity (kg) *</label>
                  <input
                    type="number"
                    required
                    placeholder="3500"
                    value={form.maxLoadCapacityKg}
                    onChange={(e) => setForm({ ...form, maxLoadCapacityKg: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Odometer (km)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.odometerKm}
                    onChange={(e) => setForm({ ...form, odometerKm: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Acquisition Cost ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    value={form.acquisitionCost}
                    onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Operating Region</label>
                  <input
                    type="text"
                    placeholder="e.g. New York"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232D42]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-primary/20 transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
