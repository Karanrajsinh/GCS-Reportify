import { GscDataResponse, GscPropertiesResponse, TimeRange } from '@/lib/types';
import axios from 'axios';

/**
 * Fetches the list of Google Search Console properties the user has access to
 */
export async function fetchGscProperties() {
  try {
    const response = await axios.get<GscPropertiesResponse>('/api/gsc/properties');
    return response.data.properties;
  } catch (error) {
    console.error('Error fetching GSC properties:', error);
    throw new Error('Failed to fetch GSC properties');
  }
}

/**
 * Fetches search analytics data from Google Search Console based on the selected
 * property, metrics, and time range
 */
export async function fetchGscData(
  siteUrl: string,
  timeRange: TimeRange,
  rowLimit: number = 1000
) {
  try {
    const response = await axios.post<GscDataResponse>('/api/gsc/data', {
      siteUrl,
      timeRange,
      rowLimit,
    });
    return response.data.rows;
  } catch (error) {
    console.error('Error fetching GSC data:', error);
    throw new Error('Failed to fetch GSC data');
  }
}