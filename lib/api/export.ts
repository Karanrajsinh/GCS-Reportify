import Papa from 'papaparse';

/**
 * Exports report data to CSV format
 */
export function exportToCsv(reportData: Record<string, any>[], filename: string = 'gsc-report.csv') {
  // Data is already formatted correctly from report-table.tsx
  const flattenedData = reportData;
  
  // Convert to CSV
  // Configure Papa Parse with options for better Excel compatibility
  const csv = Papa.unparse(flattenedData, {
    delimiter: ',',
    quotes: true, // Always quote fields
    quoteChar: '"',
    header: true,
    skipEmptyLines: true
  });
  
  // Add BOM for Excel and create download file
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
