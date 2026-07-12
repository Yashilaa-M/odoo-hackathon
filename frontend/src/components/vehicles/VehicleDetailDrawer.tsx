import { X } from 'lucide-react';
import React from 'react';

interface VehicleDetailDrawerProps {
  vehicle: any;
  auditLogs: any[];
  onClose: () => void;
}

export const VehicleDetailDrawer: React.FC<VehicleDetailDrawerProps> = ({
  vehicle,
  auditLogs,
  onClose,
}) => {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#161C2A] text-white border-l border-[#232D42] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#232D42]">
        <div>
          <h2 className="text-md font-bold">{vehicle.nameModel}</h2>
          <p className="text-xs text-gray-400 font-mono">{vehicle.registrationNumber}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6 text-sm">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Specifications</h3>
          <div className="grid grid-cols-2 gap-4 text-sm bg-[#0B0F19] p-4 rounded-xl border border-[#232D42]">
            <div>
              <span className="text-xs text-gray-500 block">Status</span>
              <span className="font-semibold">{vehicle.status}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Acquisition Cost</span>
              <span className="font-semibold">${Number(vehicle.acquisitionCost).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Load Capacity</span>
              <span className="font-semibold">{Number(vehicle.maxLoadCapacityKg).toLocaleString()} kg</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Odometer Reading</span>
              <span className="font-semibold">{Number(vehicle.odometerKm).toLocaleString()} km</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Audit History Logs</h3>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No audit trails recorded for this asset.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#0B0F19]/50 border border-[#232D42]/60 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-center text-gray-400 font-mono text-[10px]">
                    <span>{log.actor?.fullName || 'System'}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-white font-semibold">{log.action.replace(/_/g, ' ')}</p>
                  {log.metadata && (
                    <pre className="text-[10px] bg-[#0B0F19] p-1.5 rounded overflow-x-auto text-gray-400 max-h-20">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
