import { Edit2, ShieldAlert, Trash2 } from 'lucide-react';
import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { LicenseExpiryBadge } from './LicenseExpiryBadge';

interface DriverTableProps {
  drivers: any[];
  canEdit: boolean;
  canEditSafety: boolean;
  onEdit: (driver: any) => void;
  onDelete: (id: string) => void;
  onEditSafety: (driver: any) => void;
}

export const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  canEdit,
  canEditSafety,
  onEdit,
  onDelete,
  onEditSafety,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
            <th className="p-4">Driver Name</th>
            <th className="p-4">License Number</th>
            <th className="p-4">License Type</th>
            <th className="p-4">Expiry Date</th>
            <th className="p-4">Safety Score</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {drivers.map((d) => (
            <tr key={d.id} className="hover:bg-secondary/15 transition-colors">
              <td className="p-4">
                <div className="font-semibold text-foreground">{d.fullName}</div>
                <div className="text-[10px] text-muted-foreground">{d.contactNumber}</div>
              </td>
              <td className="p-4 font-mono text-xs">{d.licenseNumber}</td>
              <td className="p-4 text-xs font-semibold text-muted-foreground">{d.licenseCategory}</td>
              <td className="p-4 space-y-1">
                <div className="text-xs text-muted-foreground">{new Date(d.licenseExpiryDate).toLocaleDateString()}</div>
                <LicenseExpiryBadge expiryDate={d.licenseExpiryDate} />
              </td>
              <td className="p-4">
                <span
                  className={`font-bold ${
                    d.safetyScore >= 85
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : d.safetyScore >= 70
                        ? 'text-amber-500'
                        : 'text-red-500'
                  }`}
                >
                  {d.safetyScore}/100
                </span>
              </td>
              <td className="p-4">
                <StatusBadge status={d.status} />
              </td>
              <td className="p-4 text-right flex justify-end gap-2">
                {canEditSafety && (
                  <button
                    onClick={() => onEditSafety(d)}
                    className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded-lg"
                    title="Update Safety Score"
                  >
                    <ShieldAlert className="h-4 w-4" />
                  </button>
                )}
                {canEdit && (
                  <>
                    <button
                      onClick={() => onEdit(d)}
                      className="text-amber-500 hover:bg-amber-500/10 p-1.5 rounded-lg"
                      title="Edit Profile"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(d.id)}
                      className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg"
                      title="Delete Driver Profile"
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
  );
};
