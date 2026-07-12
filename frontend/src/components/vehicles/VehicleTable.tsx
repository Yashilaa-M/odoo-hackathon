import { Edit2, Eye, Trash2 } from 'lucide-react';
import React from 'react';
import { StatusBadge } from '../common/StatusBadge';

interface VehicleTableProps {
  vehicles: any[];
  canEdit: boolean;
  onEdit: (vehicle: any) => void;
  onDelete: (id: string) => void;
  onViewLogs: (vehicle: any) => void;
}

export const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  canEdit,
  onEdit,
  onDelete,
  onViewLogs,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
            <th className="p-4">Name/Model</th>
            <th className="p-4">Reg Number</th>
            <th className="p-4">Type</th>
            <th className="p-4">Load Limit</th>
            <th className="p-4">Odometer</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {vehicles.map((v) => (
            <tr key={v.id} className="hover:bg-secondary/15 transition-colors">
              <td className="p-4 font-semibold text-foreground">{v.nameModel}</td>
              <td className="p-4 font-mono text-xs">{v.registrationNumber}</td>
              <td className="p-4 text-xs font-semibold text-muted-foreground">{v.type}</td>
              <td className="p-4">{Number(v.maxLoadCapacityKg).toLocaleString()} kg</td>
              <td className="p-4">{Number(v.odometerKm).toLocaleString()} km</td>
              <td className="p-4">
                <StatusBadge status={v.status} />
              </td>
              <td className="p-4 text-right flex justify-end gap-2">
                <button
                  onClick={() => onViewLogs(v)}
                  className="text-primary hover:bg-primary/10 p-1.5 rounded-lg"
                  title="View Audit Logs"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {canEdit && (
                  <>
                    <button
                      onClick={() => onEdit(v)}
                      className="text-amber-500 hover:bg-amber-500/10 p-1.5 rounded-lg"
                      title="Edit Vehicle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(v.id)}
                      className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg"
                      title="Soft-Retire Vehicle"
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
