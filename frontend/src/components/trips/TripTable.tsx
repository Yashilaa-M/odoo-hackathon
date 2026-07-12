import React from 'react';
import { TripStatusStepper } from './TripStatusStepper';

interface TripTableProps {
  trips: any[];
  canModify: boolean;
  onDispatch: (id: string) => void;
  onOpenComplete: (id: string) => void;
  onCancel: (id: string) => void;
}

export const TripTable: React.FC<TripTableProps> = ({
  trips,
  canModify,
  onDispatch,
  onOpenComplete,
  onCancel,
}) => {
  return (
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
          {trips.map((t) => (
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
                <TripStatusStepper status={t.status} />
              </td>
              <td className="p-4 text-right flex justify-end gap-2">
                {canModify && t.status === 'DRAFT' && (
                  <button
                    onClick={() => onDispatch(t.id)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    Dispatch
                  </button>
                )}
                {canModify && t.status === 'DISPATCHED' && (
                  <>
                    <button
                      onClick={() => onOpenComplete(t.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => onCancel(t.id)}
                      className="text-destructive hover:bg-destructive/10 border border-destructive/25 text-xs px-3 py-1.5 rounded-lg"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {canModify && t.status === 'DRAFT' && (
                  <button
                    onClick={() => onCancel(t.id)}
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
  );
};
