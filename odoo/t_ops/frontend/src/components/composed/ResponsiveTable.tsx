/**
 * Usage:
 * <ResponsiveTable columns={columns} data={rows} renderCard={(row) => <VehicleCard vehicle={row} />} />
 */
import React from 'react';
import { DataTable, type DataTableColumn, type DataTableProps } from '../ui/DataTable';
import { GlassCard } from '../ui/GlassCard';

export interface ResponsiveTableProps<T> extends DataTableProps<T> {
  renderCard: (item: T) => React.ReactNode;
  columns: DataTableColumn<T>[];
}

export function ResponsiveTable<T>({ data, renderCard, ...props }: ResponsiveTableProps<T>) {
  return (
    <>
      <div className="hidden md:block">
        <DataTable data={data} {...props} />
      </div>
      <div className="space-y-3 md:hidden">
        {data.length ? (
          data.map((item, index) => <React.Fragment key={props.getRowId?.(item, index) ?? index}>{renderCard(item)}</React.Fragment>)
        ) : (
          <GlassCard>
            <div className="py-10 text-center text-sm text-transit-text-secondary">No records found.</div>
          </GlassCard>
        )}
      </div>
    </>
  );
}
