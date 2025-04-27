import { ReportData } from '@/lib/types';
import Papa from 'papaparse';

/**
 * Exports report data to CSV format
 */
export function exportToCsv(reportData: ReportData[], filename: string = 'gsc-report.csv') {
  // Flatten the data structure for CSV format
  const flattenedData = reportData.map(row => {
    const flatRow: Record<string, any> = {
      query: row.query,
    };
    
    // Add metrics
    Object.entries(row.metrics).forEach(([key, value]) => {
      flatRow[key] = value;
    });
    
    // Add intent data if available
    if (row.intent) {
      flatRow['intent_category'] = row.intent.category;
      flatRow['intent_description'] = row.intent.description;
    }
    
    return flatRow;
  });
  
  // Convert to CSV
  const csv = Papa.unparse(flattenedData);
  
  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}