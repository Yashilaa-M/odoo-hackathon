import React from 'react';

interface VehicleFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = React.useState({
    registrationNumber: initialData?.registrationNumber || '',
    nameModel: initialData?.nameModel || '',
    type: initialData?.type || 'TRUCK',
    maxLoadCapacityKg: initialData?.maxLoadCapacityKg || '',
    odometerKm: initialData?.odometerKm || '',
    acquisitionCost: initialData?.acquisitionCost || '',
    region: initialData?.region || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      maxLoadCapacityKg: parseFloat(form.maxLoadCapacityKg),
      odometerKm: parseFloat(form.odometerKm || '0'),
      acquisitionCost: parseFloat(form.acquisitionCost),
      region: form.region || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-400">Reg Number *</label>
          <input
            type="text"
            required
            value={form.registrationNumber}
            onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">Model *</label>
          <input
            type="text"
            required
            value={form.nameModel}
            onChange={(e) => setForm({ ...form, nameModel: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-400">Type *</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="BIKE">Bike</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">Max Capacity (kg) *</label>
          <input
            type="number"
            required
            value={form.maxLoadCapacityKg}
            onChange={(e) => setForm({ ...form, maxLoadCapacityKg: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-400">Odometer (km) *</label>
          <input
            type="number"
            required
            value={form.odometerKm}
            onChange={(e) => setForm({ ...form, odometerKm: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">Cost ($) *</label>
          <input
            type="number"
            required
            value={form.acquisitionCost}
            onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">Region</label>
          <input
            type="text"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
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
          {initialData ? 'Save Changes' : 'Register Vehicle'}
        </button>
      </div>
    </form>
  );
};
