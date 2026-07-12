import React, { useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface TripWizardProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  allVehicles: any[];
  allDrivers: any[];
}

export const TripWizard: React.FC<TripWizardProps> = ({
  onClose,
  onSubmit,
  allVehicles,
  allDrivers,
}) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    source: '',
    destination: '',
    cargoWeightKg: '',
    plannedDistanceKm: '',
    revenue: '',
    vehicleId: '',
    driverId: '',
  });

  const getVehiclesPool = () => {
    const cargoWeight = parseFloat(form.cargoWeightKg) || 0;
    return allVehicles.map((v) => {
      const isAvailable = v.status === 'AVAILABLE';
      const hasCapacity = Number(v.maxLoadCapacityKg) >= cargoWeight;
      let reason = '';
      if (!isAvailable) reason = `Currently ${v.status.replace(/_/g, ' ')}`;
      else if (!hasCapacity) reason = `Insufficient Capacity (${v.maxLoadCapacityKg} kg)`;
      return { ...v, eligible: isAvailable && hasCapacity, reason };
    });
  };

  const getDriversPool = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allDrivers.map((d) => {
      const isAvailable = d.status === 'AVAILABLE';
      const isNotSuspended = d.status !== 'SUSPENDED';
      const licenseValid = new Date(d.licenseExpiryDate) >= today;
      let reason = '';
      if (!isAvailable) reason = `Currently ${d.status.replace(/_/g, ' ')}`;
      else if (!isNotSuspended) reason = 'Driver is Suspended';
      else if (!licenseValid) reason = 'Expired License';
      return { ...d, eligible: isAvailable && isNotSuspended && licenseValid, reason };
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      const weight = parseFloat(form.cargoWeightKg);
      const distance = parseFloat(form.plannedDistanceKm);
      const rev = parseFloat(form.revenue);

      if (!form.source || !form.destination || isNaN(weight) || isNaN(distance) || isNaN(rev)) {
        toast.error('Please enter all route specifications.');
        return;
      }
      if (weight <= 0 || distance <= 0 || rev < 0) {
        toast.error('Cargo weight and distance must be positive numbers.');
        return;
      }
    } else if (step === 2) {
      if (!form.vehicleId) {
        toast.error('Please choose an eligible vehicle to continue.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.driverId) {
      toast.error('Please choose a driver to schedule.');
      return;
    }
    onSubmit({
      source: form.source,
      destination: form.destination,
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      cargoWeightKg: parseFloat(form.cargoWeightKg),
      plannedDistanceKm: parseFloat(form.plannedDistanceKm),
      revenue: parseFloat(form.revenue),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#161C2A] text-white border border-[#232D42] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
          <div>
            <h2 className="text-md font-bold">New Dispatch Scheduler</h2>
            <p className="text-[10px] text-gray-400">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-sm">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400">Start Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Warehouse A"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400">Destination *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Port Authority"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400">Cargo (kg) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={form.cargoWeightKg}
                    onChange={(e) => setForm({ ...form, cargoWeightKg: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400">Distance (km) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={form.plannedDistanceKm}
                    onChange={(e) => setForm({ ...form, plannedDistanceKm: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400">Revenue ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={form.revenue}
                    onChange={(e) => setForm({ ...form, revenue: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 block">Select Available Vehicle</label>
              <div className="max-h-60 overflow-y-auto space-y-2 border border-[#232D42] rounded-lg p-2 bg-[#0B0F19]">
                {getVehiclesPool().map((v) => (
                  <div
                    key={v.id}
                    onClick={() => v.eligible && setForm({ ...form, vehicleId: v.id })}
                    className={`p-3 rounded-lg flex justify-between items-center transition-all ${
                      !v.eligible
                        ? 'opacity-40 cursor-not-allowed bg-transparent'
                        : form.vehicleId === v.id
                          ? 'bg-primary/20 border border-primary cursor-pointer'
                          : 'hover:bg-[#161C2A] border border-[#232D42] cursor-pointer'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-white block">{v.nameModel}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {v.registrationNumber} | Max: {Number(v.maxLoadCapacityKg).toLocaleString()} kg
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

          {step === 3 && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 block">Assign Available Driver</label>
              <div className="max-h-60 overflow-y-auto space-y-2 border border-[#232D42] rounded-lg p-2 bg-[#0B0F19]">
                {getDriversPool().map((d) => (
                  <div
                    key={d.id}
                    onClick={() => d.eligible && setForm({ ...form, driverId: d.id })}
                    className={`p-3 rounded-lg flex justify-between items-center transition-all ${
                      !d.eligible
                        ? 'opacity-40 cursor-not-allowed bg-transparent'
                        : form.driverId === d.id
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

          <div className="flex justify-between gap-3 pt-4 border-t border-[#232D42]">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
              className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Previous'}
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-600/95 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Schedule Dispatch Draft
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
