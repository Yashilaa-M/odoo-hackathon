/**
 * Usage:
 * <DataTable columns={columns} data={vehicles} sortable selectable />
 */
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '../../lib/utils';

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  accessor: (item: T) => React.ReactNode;
  sortValue?: (item: T) => string | number;
  cellClassName?: string;
  headerClassName?: string;
  mobileLabel?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  sortable?: boolean;
  selectable?: boolean;
  getRowId?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
  selectedRowIds?: string[];
  onSelectionChange?: (rowIds: string[]) => void;
}

export function DataTable<T>({
  columns,
  data,
  sortable = false,
  selectable = false,
  getRowId = (_, index) => `${index}`,
  onRowClick,
  emptyState,
  loading = false,
  selectedRowIds = [],
  onSelectionChange,
}: DataTableProps<T>) {
  const [sortState, setSortState] = React.useState<{ columnId: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sortable || !sortState) return data;
    const column = columns.find((entry) => entry.id === sortState.columnId);
    if (!column?.sortValue) return data;

    return [...data].sort((left, right) => {
      const a = column.sortValue?.(left);
      const b = column.sortValue?.(right);
      if (a == null || b == null) return 0;
      if (a === b) return 0;
      const modifier = sortState.direction === 'asc' ? 1 : -1;
      return a > b ? modifier : -modifier;
    });
  }, [columns, data, sortState, sortable]);

  if (loading) {
    return (
      <GlassCard className="overflow-hidden p-0">
        <div className="space-y-3 p-4" aria-label="Loading table rows">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="relative h-12 overflow-hidden rounded-2xl bg-white/5">
              <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-full animate-shimmer bg-cyan-300/15 blur-md" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (!sortedData.length) {
    return <GlassCard>{emptyState ?? <div className="py-10 text-center text-sm text-transit-text-secondary">No records found.</div>}</GlassCard>;
  }

  const allSelected = selectable && sortedData.length > 0 && selectedRowIds.length === sortedData.length;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-transit-surface1/96 backdrop-blur">
            <tr className="border-b border-border">
              {selectable ? (
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allSelected}
                    onChange={(event) =>
                      onSelectionChange?.(
                        event.currentTarget.checked ? sortedData.map((item, index) => getRowId(item, index)) : [],
                      )
                    }
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const isSorted = sortState?.columnId === column.id;
                return (
                  <th key={column.id} className={cn('px-4 py-4 text-[11px] uppercase tracking-[0.22em] text-transit-text-secondary', column.headerClassName)}>
                    <button
                      type="button"
                      disabled={!sortable || !column.sortValue}
                      onClick={() =>
                        setSortState((current) =>
                          current?.columnId === column.id
                            ? { columnId: column.id, direction: current.direction === 'asc' ? 'desc' : 'asc' }
                            : { columnId: column.id, direction: 'asc' },
                        )
                      }
                      className="inline-flex items-center gap-1 disabled:cursor-default"
                    >
                      {column.header}
                      {isSorted ? (
                        sortState?.direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                      ) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const rowId = getRowId(item, index);
              const selected = selectedRowIds.includes(rowId);
              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'border-b border-border/80 transition hover:bg-white/[0.03]',
                    onRowClick && 'cursor-pointer',
                    selected && 'bg-cyan-400/5',
                  )}
                >
                  {selectable ? (
                    <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select row ${index + 1}`}
                        checked={selected}
                        onChange={(event) => {
                          const next = event.currentTarget.checked
                            ? [...selectedRowIds, rowId]
                            : selectedRowIds.filter((id) => id !== rowId);
                          onSelectionChange?.(next);
                        }}
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={column.id} className={cn('px-4 py-4 align-top text-foreground', column.cellClassName)}>
                      {column.accessor(item)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
