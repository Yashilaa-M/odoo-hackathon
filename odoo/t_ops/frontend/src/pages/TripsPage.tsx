import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Plus, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { SkeletonTable } from '../components/common/SkeletonCard';
import { useTrips } from '../hooks/useTrips';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../store/auth.store';

export const TripsPage: React.FC = () => {
  const { user } = useAuthStore();
  const canModify = user?.role === 'DRIVER' || user?.role === 'FLEET_MANAGER';

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Fetch trips
  const { tripsQuery, createTrip, dispatchTrip, completeTrip, cancelTrip } = useTrips({
    search,
    status,
  });
  const { data: trips, isLoading } = tripsQuery;

  // Fetch all vehicles and drivers for the Wizard lookup
  const { data: allVehicles } = useQuery<any[]>({
    queryKey: ['all-vehicles-lookup'],
    queryFn: () => apiClient.get('/vehicles'),
  });

  const { data: allDrivers } = useQuery<any[]>({
    queryKey: ['all-drivers-lookup'],
    queryFn: () => apiClient.get('/drivers'),
  });

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [wizardForm, setWizardForm] = useState({
    source: '',
    destination: '',
    cargoWeightKg: '',
    plannedDistanceKm: '',
    revenue: '',
    vehicleId: '',
    driverId: '',
  });

  // Completion modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);
  const [completionForm, setCompletionForm] = useState({
    actualDistanceKm: '',
    fuelConsumedL: '',
  });

  // Filter vehicles for step 2
  const getVehiclesPool = () => {
    if (!allVehicles) return [];
    const cargoWeight = parseFloat(wizardForm.cargoWeightKg) || 0;

    return allVehicles.map((v) => {
      const isAvailable = v.status === 'AVAILABLE';
      const hasCapacity = Number(v.maxLoadCapacityKg) >= cargoWeight;
      let reason = '';

      if (!isAvailable) reason = `Currently ${v.status.replace('_', ' ')}`;
      else if (!hasCapacity) reason = `Insufficient Capacity (${v.maxLoadCapacityKg} kg)`;

      return {
        ...v,
        eligible: isAvailable && hasCapacity,
        reason,
      };
    });
  };

  // Filter drivers for step 3
  const getDriversPool = () => {
    if (!allDrivers) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allDrivers.map((d) => {
      const isAvailable = d.status === 'AVAILABLE';
      const isNotSuspended = d.status !== 'SUSPENDED';
      const licenseValid = new Date(d.licenseExpiryDate) >= today;
      let reason = '';

      if (!isAvailable) reason = `Currently ${d.status.replace('_', ' ')}`;
      else if (!isNotSuspended) reason = 'Driver is Suspended';
      else if (!licenseValid) reason = 'Expired License';

      return {
        ...d,
        eligible: isAvailable && isNotSuspended && licenseValid,
        reason,
      };
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      const weight = parseFloat(wizardForm.cargoWeightKg);
      const distance = parseFloat(wizardForm.plannedDistanceKm);
      const rev = parseFloat(wizardForm.revenue);

      if (
        !wizardForm.source ||
        !wizardForm.destination ||
        isNaN(weight) ||
        isNaN(distance) ||
        isNaN(rev)
      ) {
        toast.error('Please enter all route specifications.');
        return;
      }
      if (weight <= 0 || distance <= 0 || rev < 0) {
        toast.error('Cargo weight, distance must be positive numbers');
        return;
      }
    } else if (step === 2) {
      if (!wizardForm.vehicleId) {
        toast.error('Please choose an eligible vehicle to continue.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardForm.driverId) {
      toast.error('Please choose a driver to schedule.');
      return;
    }

    createTrip.mutate(
      {
        source: wizardForm.source,
        destination: wizardForm.destination,
        vehicleId: wizardForm.vehicleId,
        driverId: wizardForm.driverId,
        cargoWeightKg: parseFloat(wizardForm.cargoWeightKg),
        plannedDistanceKm: parseFloat(wizardForm.plannedDistanceKm),
        revenue: parseFloat(wizardForm.revenue),
      },
      {
        onSuccess: () => {
          toast.success('Trip created as DRAFT.');
          setWizardOpen(false);
          setStep(1);
          setWizardForm({
            source: '',
            destination: '',
            cargoWeightKg: '',
            plannedDistanceKm: '',
            revenue: '',
            vehicleId: '',
            driverId: '',
          });
        },
        onError: (err: any) => {
          toast.error(err.friendlyMessage || 'Failed to create trip');
        },
      },
    );
  };

  const handleDispatch = (id: string) => {
    dispatchTrip.mutate(id, {
      onSuccess: () => {
        toast.success('Trip dispatched! Vehicle and driver status updated to ON TRIP.');
      },
      onError: (err: any) => {
        toast.error(err.friendlyMessage || 'Dispatch failed.');
      },
    });
  };

  const handleOpenComplete = (id: string) => {
    setCompletingTripId(id);
    setCompletionForm({
      actualDistanceKm: '',
      fuelConsumedL: '',
    });
    setCompleteModalOpen(true);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const distance = parseFloat(completionForm.actualDistanceKm);
    const fuel = parseFloat(completionForm.fuelConsumedL);

    if (isNaN(distance) || isNaN(fuel) || distance <= 0 || fuel <= 0) {
      toast.error('Please enter valid positive numbers.');
      return;
    }

    if (completingTripId) {
      completeTrip.mutate(
        {
          id: completingTripId,
          data: {
            actualDistanceKm: distance,
            fuelConsumedL: fuel,
          },
        },
        {
          onSuccess: () => {
            toast.success('Trip completed. Vehicle/driver returned to Available pool.');
            setCompleteModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.friendlyMessage || 'Failed to complete trip.');
          },
        },
      );
    }
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      cancelTrip.mutate(id, {
        onSuccess: () => {
          toast.success('Trip cancelled successfully.');
        },
        onError: (err: any) => {
          toast.error(err.friendlyMessage || 'Failed to cancel.');
        },
      });
    }
  };

  // State Stepper component
  const TripStepper: React.FC<{ status: string }> = ({ status }) => {
    const steps = ['DRAFT', 'DISPATCHED', 'COMPLETED'];
    const currentIdx = steps.indexOf(status);

    if (status === 'CANCELLED') {
      return (
        <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2.5 py-0.5 rounded-full border border-red-200/20">
          CANCELLED
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2 text-xs">
        {steps.map((st, i) => {
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;

          return (
            <React.Fragment key={st}>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full tracking-wide text-[9px] uppercase ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isDone
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {st}
              </span>
              {i < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Trip Dispatch Management</h1>
          <p className="text-sm text-muted-foreground">Plan routes, assign drivers and dispatch fleet assets.</p>
        </div>
        {canModify && (
          <button
            onClick={() => {
              setWizardForm({
                source: '',
                destination: '',
                cargoWeightKg: '',
                plannedDistanceKm: '',
                revenue: '',
                vehicleId: '',
                driverId: '',
              });
              setStep(1);
              setWizardOpen(true);
            }}
            className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Create Trip Wizard
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by source or destination..."
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
            <option value="DRAFT">Draft</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable />
        ) : !trips || trips.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No trips registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">Route Details</th>
                  <th className="p-4">Assigned Vehicle</th>
                  <th className="p-4">Assigned Driver</th>
                  <th className="p-4">Trip Lifecycle</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trips.map((t: any) => (
                  <tr key={t.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-foreground">
                        {t.source} → {t.destination}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Cargo: {t.cargoWeightKg} kg | Distance: {t.plannedDistanceKm} km
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground font-medium">{t.vehicle.nameModel}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{t.vehicle.registrationNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground font-medium">{t.driver.fullName}</div>
                      <div className="text-[10px] text-muted-foreground">{t.driver.contactNumber}</div>
                    </td>
                    <td className="p-4">
                      <TripStepper status={t.status} />
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      {canModify && t.status === 'DRAFT' && (
                        <button
                          onClick={() => handleDispatch(t.id)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          Dispatch
                        </button>
                      )}
                      {canModify && t.status === 'DISPATCHED' && (
                        <>
                          <button
                            onClick={() => handleOpenComplete(t.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancel(t.id)}
                            className="text-destructive hover:bg-destructive/10 border border-destructive/25 text-xs px-3 py-1.5 rounded-lg"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {canModify && t.status === 'DRAFT' && (
                        <button
                          onClick={() => handleCancel(t.id)}
                          className="text-muted-foreground hover:text-foreground text-xs px-3 py-1.5"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trip Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#161C2A] text-white border border-[#232D42] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
              <div>
                <h2 className="text-md font-bold">New Dispatch Scheduler</h2>
                <p className="text-[10px] text-gray-400">Step {step} of 3</p>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#232D42]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Wizard Steps */}
            <form onSubmit={handleWizardSubmit} className="p-6 space-y-4 text-sm">
              {/* STEP 1: Specs */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Start Location *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Warehouse A"
                        value={wizardForm.source}
                        onChange={(e) => setWizardForm({ ...wizardForm, source: e.target.value })}
                        className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Destination *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Port Authority"
                        value={wizardForm.destination}
                        onChange={(e) => setWizardForm({ ...wizardForm, destination: e.target.value })}
                        className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Cargo Weight (kg) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 5000"
                        value={wizardForm.cargoWeightKg}
                        onChange={(e) => setWizardForm({ ...wizardForm, cargoWeightKg: e.target.value })}
                        className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Est. Distance (km) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 450"
                        value={wizardForm.plannedDistanceKm}
                        onChange={(e) => setWizardForm({ ...wizardForm, plannedDistanceKm: e.target.value })}
                        className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Trip Revenue ($) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 1500"
                        value={wizardForm.revenue}
                        onChange={(e) => setWizardForm({ ...wizardForm, revenue: e.target.value })}
                        className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Vehicle Pool */}
              {step === 2 && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Select Available Fleet Vehicle</label>
                  <div className="max-h-60 overflow-y-auto space-y-2 border border-[#232D42] rounded-lg p-2 bg-[#0B0F19]">
                    {getVehiclesPool().map((v: any) => (
                      <div
                        key={v.id}
                        onClick={() => v.eligible && setWizardForm({ ...wizardForm, vehicleId: v.id })}
                        className={`p-3 rounded-lg flex justify-between items-center transition-all ${
                          !v.eligible
                            ? 'opacity-40 cursor-not-allowed bg-transparent'
                            : wizardForm.vehicleId === v.id
                              ? 'bg-primary/20 border border-primary cursor-pointer'
                              : 'hover:bg-[#161C2A] border border-[#232D42] cursor-pointer'
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-white block">{v.nameModel}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {v.registrationNumber} | Max: {v.maxLoadCapacityKg} kg
                          </span>
                        </div>
                        {!v.eligible ? (
                          <span className="text-[10px] text-red-500 font-bold uppercase">{v.reason}</span>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-semibold">Available</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Driver Pool */}
              {step === 3 && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Assign Available Driver</label>
                  <div className="max-h-60 overflow-y-auto space-y-2 border border-[#232D42] rounded-lg p-2 bg-[#0B0F19]">
                    {getDriversPool().map((d: any) => (
                      <div
                        key={d.id}
                        onClick={() => d.eligible && setWizardForm({ ...wizardForm, driverId: d.id })}
                        className={`p-3 rounded-lg flex justify-between items-center transition-all ${
                          !d.eligible
                            ? 'opacity-40 cursor-not-allowed bg-transparent'
                            : wizardForm.driverId === d.id
                              ? 'bg-primary/20 border border-primary cursor-pointer'
                              : 'hover:bg-[#161C2A] border border-[#232D42] cursor-pointer'
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-white block">{d.fullName}</span>
                          <span className="text-[10px] text-gray-400">
                            License: {d.licenseCategory} ({d.licenseNumber})
                          </span>
                        </div>
                        {!d.eligible ? (
                          <span className="text-[10px] text-red-500 font-bold uppercase">{d.reason}</span>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-semibold">Available</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wizard Nav */}
              <div className="flex justify-between gap-3 pt-4 border-t border-[#232D42]">
                <button
                  type="button"
                  onClick={() => (step > 1 ? setStep(step - 1) : setWizardOpen(false))}
                  className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {step === 1 ? 'Cancel' : 'Previous'}
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-primary/20 transition-colors"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-600/95 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-emerald-600/20 transition-colors"
                  >
                    Schedule Dispatch Draft
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#161C2A] text-white border border-[#232D42] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
              <h2 className="text-md font-bold">Complete Trip Logs</h2>
              <button
                onClick={() => setCompleteModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Actual Distance Traveled (km) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 392"
                  value={completionForm.actualDistanceKm}
                  onChange={(e) => setCompletionForm({ ...completionForm, actualDistanceKm: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Fuel Consumed (Liters) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 140"
                  value={completionForm.fuelConsumedL}
                  onChange={(e) => setCompletionForm({ ...completionForm, fuelConsumedL: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232D42]">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-600/95 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
                >
                  Complete Trip Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
