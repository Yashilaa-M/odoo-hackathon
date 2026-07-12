import React, { useState } from 'react';

interface MaintenanceFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  availableVehicles: any[];
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  onSubmit,
  onCancel,
  availableVehicles,
}) => {
  const [form, setForm] = useState({
    vehicleId: '',
    type: '',
    description: '',
    cost: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vehicleId: form.vehicleId,
      type: form.type,
      description: form.description || undefined,
      cost: parseFloat(form.cost || '0'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400">Select Available Vehicle *</label>
        <select
          required
          value={form.vehicleId}
          onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
          className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
        >
          <option value="">-- Choose Vehicle --</option>
          {availableVehicles?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nameModel} ({v.registrationNumber})
            </option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500">Only vehicles in AVAILABLE status can go to shop.</p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400">Service Category Type *</label>
        <input
          type="text"
          required
          placeholder="e.g. Engine Check, Brake Repair"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400">Detailed Description</label>
        <textarea
          rows={3}
          placeholder="Brake pedal feels soft. Inspect lines and pads."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400">Est. Initial Cost ($) *</label>
        <input
          type="number"
          required
          placeholder="e.g. 250"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
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
          Confirm Entry
        </button>
      </div>
    </form>
  );
};
