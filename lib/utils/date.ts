import { addDays, format, subDays, subMonths } from 'date-fns';
import { CustomTimeRange, PredefinedTimeRange, TimeRange } from '@/lib/types';

/**
 * Converts a predefined time range to a date range with start and end dates
 */
export function getDateRangeFromPredefined(timeRange: PredefinedTimeRange): CustomTimeRange {
  const today = new Date();
  const endDate = format(today, 'yyyy-MM-dd');
  
  let startDate: string;
  
  switch (timeRange) {
    case 'last7days':
      startDate = format(subDays(today, 7), 'yyyy-MM-dd');
      break;
    case 'last28days':
      startDate = format(subDays(today, 28), 'yyyy-MM-dd');
      break;
    case 'last3months':
      startDate = format(subMonths(today, 3), 'yyyy-MM-dd');
      break;
    default:
      startDate = format(subDays(today, 7), 'yyyy-MM-dd');
  }
  
  return { startDate, endDate };
}

/**
 * Formats a time range object into a human-readable string
 */
export function formatTimeRange(timeRange: TimeRange): string {
  if (typeof timeRange === 'string') {
    switch (timeRange) {
      case 'last7days':
        return 'Last 7 Days';
      case 'last28days':
        return 'Last 28 Days';
      case 'last3months':
        return 'Last 3 Months';
      default:
        return 'Custom Range';
    }
  } else {
    return `${timeRange.startDate} to ${timeRange.endDate}`;
  }
}