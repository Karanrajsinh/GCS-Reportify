import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getDateRangeFromPredefined } from '@/lib/utils/date';
import { TimeRange } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const auth = getAuth(request);
    const { siteUrl, timeRange, rowLimit = 1000 } = await request.json();
    
    // Get OAuth token from Clerk
    const token = await auth.getToken({ template: 'google' });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    // Initialize Search Console API
    const searchConsole = google.webmasters({
      version: 'v3',
      auth: oauth2Client,
    });

    // Process time range
    let startDate: string;
    let endDate: string;
    
    if (typeof timeRange === 'string') {
      const dateRange = getDateRangeFromPredefined(timeRange);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    } else {
      startDate = timeRange.startDate;
      endDate = timeRange.endDate;
    }

    // Fetch search analytics data
    const { data } = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit,
      }
    });
    
    // Process and return the data
    const rows = data.rows?.map(row => ({
      query: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })) || [];

    return NextResponse.json({ rows });
  } catch (error: any) {
    console.error('Error fetching GSC data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch GSC data' },
      { status: 500 }
    );
  }
}