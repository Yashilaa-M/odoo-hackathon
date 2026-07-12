import React, { useState } from 'react';

interface ExpenseFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  vehicles: any[];
  activeTrips: any[];
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  onCancel,
  vehicles,
  activeTrips,
}) => {
  const [form, setForm] = useState({
    vehicleId: '',
    tripId: '',
    category: 'TOLL',
    amount: '',
    description: '',
    incurredDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vehicleId: form.vehicleId,
      tripId: form.tripId || undefined,
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description || undefined,
      incurredDate: form.incurredDate,
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
          <label className="text-xs font-semibold text-gray-400">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
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
          <label className="text-xs font-semibold text-gray-400">Linked Active Trip</label>
          <select
            value={form.tripId}
            onChange={(e) => setForm({ ...form, tripId: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="">-- None (Fleet Overall) --</option>
            {activeTrips?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.source} → {t.destination}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Amount ($) *</label>
          <input
            type="number"
            required
            placeholder="e.g. 45.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400">Incurred Date *</label>
        <input
          type="date"
          required
          value={form.incurredDate}
          onChange={(e) => setForm({ ...form, incurredDate: e.target.value })}
          className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400">Description / Memo</label>
        <textarea
          rows={2}
          placeholder="e.g. Highway tolls for Chicago run"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
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
          Save Transaction
        </button>
      </div>
    </form>
  );
};
