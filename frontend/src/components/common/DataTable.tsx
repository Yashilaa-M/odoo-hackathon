import React from 'react';

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ columns, data, onRowClick }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={idx} className={`p-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-secondary/15 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`p-4 ${col.className || ''}`}>
                  {col.accessor(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
