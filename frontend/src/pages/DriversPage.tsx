import { Plus, Search, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { SkeletonTable } from '../components/common/SkeletonCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDrivers } from '../hooks/useDrivers';
import { useAuthStore } from '../store/auth.store';

export const DriversPage: React.FC = () => {
  const { user } = useAuthStore();
  const hasWriteAccess = user?.role === 'SAFETY_OFFICER' || user?.role === 'FLEET_MANAGER';

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Fetch Drivers
  const { driversQuery, createDriver, updateDriver, deleteDriver } = useDrivers({
    search,
    status,
  });

  const { data: drivers, isLoading } = driversQuery;

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    licenseNumber: '',
    licenseCategory: '',
    licenseExpiryDate: '',
    contactNumber: '',
    safetyScore: '100',
    status: 'AVAILABLE',
  });

  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  const resetForm = () => {
    setForm({
      fullName: '',
      licenseNumber: '',
      licenseCategory: '',
      licenseExpiryDate: '',
      contactNumber: '',
      safetyScore: '100',
      status: 'AVAILABLE',
    });
    setEditingId(null);
  };

  const handleEdit = (dr: any) => {
    setEditingId(dr.id);
    setForm({
      fullName: dr.fullName,
      licenseNumber: dr.licenseNumber,
      licenseCategory: dr.licenseCategory,
      licenseExpiryDate: new Date(dr.licenseExpiryDate).toISOString().split('T')[0],
      contactNumber: dr.contactNumber,
      safetyScore: dr.safetyScore.toString(),
      status: dr.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const score = parseFloat(form.safetyScore);
    if (!form.fullName || !form.licenseNumber || !form.licenseExpiryDate || isNaN(score)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (score < 0 || score > 100) {
      toast.error('Safety score must be between 0 and 100');
      return;
    }

    const payload = {
      fullName: form.fullName,
      licenseNumber: form.licenseNumber,
      licenseCategory: form.licenseCategory,
      licenseExpiryDate: form.licenseExpiryDate,
      contactNumber: form.contactNumber,
      safetyScore: score,
      status: form.status,
    };

    if (editingId) {
      updateDriver.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success('Driver compliance files updated.');
            setModalOpen(false);
            resetForm();
          },
          onError: (err: any) => {
            toast.error(err.friendlyMessage || 'Failed to update driver');
          },
        },
      );
    } else {
      createDriver.mutate(payload, {
        onSuccess: () => {
          toast.success('Driver profile registered successfully.');
          setModalOpen(false);
          resetForm();
        },
        onError: (err: any) => {
          toast.error(err.friendlyMessage || 'Failed to register driver');
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to suspend or delete this driver?')) {
      deleteDriver.mutate(id, {
        onSuccess: (res: any) => {
          toast.success(res.message || 'Driver profile updated');
          if (selectedDriver?.id === id) setSelectedDriver(null);
        },
        onError: (err: any) => {
          toast.error(err.friendlyMessage || 'Failed to delete driver');
        },
      });
    }
  };

  // License Expiry Visual Alert
  const getExpiryState = (expiryDateStr: string) => {
    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      return {
        label: 'EXPIRED',
        styles: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200/30',
      };
    }

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return {
        label: `EXPIRING IN ${diffDays} DAYS`,
        styles: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/30',
      };
    }

    return {
      label: 'VALID',
      styles: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/30',
    };
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Driver Management</h1>
          <p className="text-sm text-muted-foreground">Monitor safety scores and license compliance records.</p>
        </div>
        {hasWriteAccess && (
          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Add Driver Profile
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
            placeholder="Search by driver name or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <SkeletonTable />
          ) : !drivers || drivers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No driver records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4">Driver Name</th>
                    <th className="p-4">License Category</th>
                    <th className="p-4">License Validity</th>
                    <th className="p-4">Safety Score</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {drivers.map((d: any) => {
                    const expiryState = getExpiryState(d.licenseExpiryDate);
                    return (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDriver(d)}
                        className={`hover:bg-secondary/25 transition-colors cursor-pointer ${
                          selectedDriver?.id === d.id ? 'bg-secondary/40 font-medium' : ''
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{d.fullName}</div>
                          <div className="text-[10px] text-muted-foreground">{d.contactNumber}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-foreground">{d.licenseCategory}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-mono">{d.licenseNumber}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-full ${expiryState.styles}`}>
                            {expiryState.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-bold ${
                              d.safetyScore >= 90
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : d.safetyScore >= 75
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {d.safetyScore}/100
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {hasWriteAccess && (
                            <>
                              <button
                                onClick={() => handleEdit(d)}
                                className="text-primary hover:text-primary/80 font-medium text-xs bg-primary/10 px-2.5 py-1 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(d.id)}
                                className="text-destructive hover:text-destructive/80 font-medium text-xs bg-destructive/10 p-1 rounded"
                                title="Delete or Suspend driver"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Driver Drawer */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-md font-bold text-foreground">Compliance Profile</h3>
            <p className="text-xs text-muted-foreground">Select a driver from the list.</p>
          </div>

          {selectedDriver ? (
            <div className="space-y-6 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-foreground">{selectedDriver.fullName}</span>
                <StatusBadge status={selectedDriver.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-b border-border pb-4">
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">License No.</span>
                  <span className="text-foreground font-semibold font-mono">{selectedDriver.licenseNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Category</span>
                  <span className="text-foreground font-semibold">{selectedDriver.licenseCategory}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Expiry Date</span>
                  <span className="text-foreground font-semibold">
                    {new Date(selectedDriver.licenseExpiryDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Safety Rating</span>
                  <span className="text-foreground font-semibold">{selectedDriver.safetyScore}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Contact</span>
                  <span className="text-foreground font-semibold">{selectedDriver.contactNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[10px]">Login Account</span>
                  <span className="text-foreground font-semibold truncate block">
                    {selectedDriver.user?.email || 'No linked user'}
                  </span>
                </div>
              </div>

              {/* Trip History */}
              <div className="space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Recent Trips</h4>
                {selectedDriver.trips && selectedDriver.trips.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDriver.trips.map((trip: any) => (
                      <div key={trip.id} className="p-3 bg-secondary/35 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>
                            {trip.source} → {trip.destination}
                          </span>
                          <StatusBadge status={trip.status} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Revenue: ${trip.revenue} | Distance: {trip.plannedDistanceKm} km
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No historical trip registry.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-muted-foreground italic">
              No driver selected. Click on a table row.
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#161C2A] text-white border border-[#232D42] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
              <h2 className="text-md font-bold">
                {editingId ? 'Modify Driver Compliance Details' : 'Register Driver Profile'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#232D42]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">License ID Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-NY-8912"
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">License Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="Class A CDL"
                    value={form.licenseCategory}
                    onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Expiration Date *</label>
                  <input
                    type="date"
                    required
                    value={form.licenseExpiryDate}
                    onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Contact Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="212-555-0199"
                    value={form.contactNumber}
                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Safety Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="100"
                    value={form.safetyScore}
                    onChange={(e) => setForm({ ...form, safetyScore: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Driver Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_TRIP">On Trip</option>
                    <option value="OFF_DUTY">Off Duty</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
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
                  {editingId ? 'Save Changes' : 'Add Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
