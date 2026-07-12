import React, { useState } from 'react';

interface FuelLogFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  vehicles: any[];
  activeTrips: any[];
}

export const FuelLogForm: React.FC<FuelLogFormProps> = ({
  onSubmit,
  onCancel,
  vehicles,
  activeTrips,
}) => {
  const [form, setForm] = useState({
    vehicleId: '',
    tripId: '',
    liters: '',
    cost: '',
    loggedDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vehicleId: form.vehicleId,
      tripId: form.tripId || undefined,
      liters: parseFloat(form.liters),
      cost: parseFloat(form.cost),
      loggedDate: form.loggedDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Select Vehicle *</label>
          <select
            required
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="">-- Select --</option>
            {vehicles?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} ({v.nameModel})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Linked Dispatched Trip</label>
          <select
            value={form.tripId}
            onChange={(e) => setForm({ ...form, tripId: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="">-- None (Refill) --</option>
            {activeTrips?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.source} → {t.destination}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Liters Dispensed *</label>
          <input
            type="number"
            required
            placeholder="e.g. 50"
            value={form.liters}
            onChange={(e) => setForm({ ...form, liters: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Total Bill Cost ($) *</label>
          <input
            type="number"
            required
            placeholder="e.g. 72.50"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400">Refill Date *</label>
        <input
          type="date"
          required
          value={form.loggedDate}
          onChange={(e) => setForm({ ...form, loggedDate: e.target.value })}
          className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#232D42]">
        <button
          type="button"
          onClick={onCancel}
          className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Confirm Refill Log
        </button>
      </div>
    </form>
  );
};
