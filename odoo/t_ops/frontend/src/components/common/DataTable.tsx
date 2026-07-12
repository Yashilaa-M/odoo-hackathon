import React from 'react';
import { DataTable as TransitDataTable, type DataTableColumn } from '../ui/DataTable';

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
  const mappedColumns: DataTableColumn<T>[] = columns.map((column, index) => ({
    id: `${index}-${column.header}`,
    header: column.header,
    accessor: column.accessor,
    cellClassName: column.className,
  }));

  return <TransitDataTable columns={mappedColumns} data={data} onRowClick={onRowClick} />;
}
