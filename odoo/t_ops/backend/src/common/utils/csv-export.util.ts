export function jsonToCSV(headers: string[], rows: any[][]): string {
  const headerLine = headers.join(',');
  const rowLines = rows.map((row) =>
    row
      .map((value) => {
        if (value === null || value === undefined) return '';
        const strVal = String(value);
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      })
      .join(','),
  );
  return [headerLine, ...rowLines].join('\r\n');
}
