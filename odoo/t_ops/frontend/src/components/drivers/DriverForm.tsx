import React from 'react';

interface DriverFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DriverForm: React.FC<DriverFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = React.useState({
    fullName: initialData?.fullName || '',
    licenseNumber: initialData?.licenseNumber || '',
    licenseCategory: initialData?.licenseCategory || 'Class A',
    licenseExpiryDate: initialData?.licenseExpiryDate
      ? new Date(initialData.licenseExpiryDate).toISOString().split('T')[0]
      : '',
    contactNumber: initialData?.contactNumber || '',
    safetyScore: initialData?.safetyScore || '100',
    status: initialData?.status || 'AVAILABLE',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      safetyScore: parseFloat(form.safetyScore),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-400">Full Name *</label>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">License Number *</label>
          <input
            type="text"
            required
            value={form.licenseNumber}
            onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-400">License Category *</label>
          <input
            type="text"
            required
            value={form.licenseCategory}
            onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">License Expiry Date *</label>
          <input
            type="date"
            required
            value={form.licenseExpiryDate}
            onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-400">Contact *</label>
          <input
            type="text"
            required
            value={form.contactNumber}
            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">Safety Score (0-100) *</label>
          <input
            type="number"
            required
            min={0}
            max={100}
            value={form.safetyScore}
            onChange={(e) => setForm({ ...form, safetyScore: e.target.value })}
            className="w-full bg-[#0B0F19] border border-[#232D42] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">Status *</label>
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
          onClick={onCancel}
          className="bg-[#232D42] hover:bg-[#2e3b56] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {initialData ? 'Save Changes' : 'Register Driver'}
        </button>
      </div>
    </form>
  );
};
