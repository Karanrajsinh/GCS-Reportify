import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';
import { google } from 'googleapis';
import { z } from 'zod';
import axios from 'axios';
import { getDateRangeFromPredefined } from '@/lib/utils/date';
import { TimeRange, PredefinedTimeRange } from '@/lib/types';

// Schema for validating request body
const RequestSchema = z.object({
    siteUrl: z.string().min(1, 'Site URL is required'),
    timeRanges: z.array(z.enum(['last7days', 'last28days', 'last3months'])).optional(),
    rowLimit: z.number().int().min(1).max(25000).default(1000),
});

// Schema for validating response data
const SearchAnalyticsRowSchema = z.object({
    query: z.string(),
    clicks: z.number(),
    impressions: z.number(),
    ctr: z.number(),
    position: z.number(),
});

// Type guard for PredefinedTimeRange
function isPredefinedTimeRange(timeRange: any): timeRange is PredefinedTimeRange {
    return typeof timeRange === 'string' && ['last7days', 'last28days', 'last3months'].includes(timeRange);
}

/**
 * Fetches GSC search analytics data for multiple time ranges.
 * @param request - Next.js request object
 * @returns JSON response with aggregated metrics by time range
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const parsedBody = RequestSchema.safeParse(body);
        if (!parsedBody.success) {
            console.error('Invalid request body:', parsedBody.error);
            return NextResponse.json(
                { error: 'Invalid request body', details: parsedBody.error },
                { status: 400 }
            );
        }

        const { siteUrl, timeRanges = ['last7days', 'last28days', 'last3months'], rowLimit } = parsedBody.data;

        // Get Google OAuth access token
        let token;
        try {
            const oauthToken = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_google');
            token = oauthToken?.[0]?.token;
            console.log('Clerk OAuth Token:', token ? { tokenLength: token.length, tokenPreview: token.slice(0, 10) + '...' } : 'No OAuth token');
        } catch (oauthError: any) {
            console.error('Clerk OAuth Token Error:', oauthError);
            return NextResponse.json(
                { error: 'Failed to retrieve Google OAuth token' },
                { status: 401 }
            );
        }

        if (!token) {
            console.error('No OAuth token found');
            return NextResponse.json(
                { error: 'No Google OAuth token available' },
                { status: 401 }
            );
        }

        // Validate token scope
        try {
            const tokenInfo = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
            console.log('Google Token Info:', tokenInfo.data);
            if (!tokenInfo.data.scope?.includes('https://www.googleapis.com/auth/webmasters.readonly')) {
                console.error('Missing required scope: https://www.googleapis.com/auth/webmasters.readonly');
                return NextResponse.json(
                    { error: 'Token missing required webmasters.readonly scope' },
                    { status: 401 }
                );
            }
        } catch (tokenError: any) {
            console.error('Token Validation Error:', tokenError.response?.data || tokenError.message);
            return NextResponse.json(
                { error: 'Invalid Google OAuth token' },
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

        // Fetch data for each time range
        const results: Record<string, { rows: any[]; metadata: any }> = {};
        for (const timeRange of timeRanges as PredefinedTimeRange[]) {
            const { startDate, endDate } = getDateRangeFromPredefined(timeRange);
            console.log('Fetching data for:', { siteUrl, timeRange, startDate, endDate, rowLimit });

            let data;
            try {
                const response = await searchConsole.searchanalytics.query({
                    siteUrl,
                    requestBody: {
                        startDate,
                        endDate,
                        dimensions: ['query'],
                        rowLimit,
                    },
                });
                data = response.data;
                console.log(`Received GSC data for ${timeRange}:`, {
                    rowCount: data.rows?.length || 0,
                    responseMetadata: data.responseAggregationType,
                    sampleRow: data.rows?.[0],
                });
            } catch (gscError: any) {
                console.error(`GSC API Call Error for ${timeRange}:`, gscError.response?.data || gscError.message);
                return NextResponse.json(
                    { error: `Failed to fetch GSC data for ${timeRange}: ` + (gscError.response?.data?.error?.message || gscError.message) },
                    { status: gscError.response?.status || 500 }
                );
            }

            // Process and validate rows
            const rows = data.rows?.map((row) => ({
                query: row.keys?.[0] || '',
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0,
            })) || [];

            const parsedRows = z.array(SearchAnalyticsRowSchema).safeParse(rows);
            if (!parsedRows.success) {
                console.error(`Invalid GSC data format for ${timeRange}:`, parsedRows.error);
                return NextResponse.json(
                    { error: `Invalid GSC data format for ${timeRange}` },
                    { status: 500 }
                );
            }

            results[timeRange] = {
                rows: parsedRows.data,
                metadata: { startDate, endDate, totalRows: rows.length },
            };
        }

        // Aggregate metrics for each time range
        const aggregated = Object.fromEntries(
            timeRanges.map((timeRange) => {
                const rows = results[timeRange].rows;
                const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
                const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
                const avgCtr = rows.length ? rows.reduce((sum, row) => sum + row.ctr, 0) / rows.length : 0;
                const avgPosition = rows.length ? rows.reduce((sum, row) => sum + row.position, 0) / rows.length : 0;

                return [
                    timeRange,
                    {
                        clicks: totalClicks,
                        impressions: totalImpressions,
                        ctr: avgCtr,
                        position: avgPosition,
                        metadata: results[timeRange].metadata,
                    },
                ];
            })
        );

        return NextResponse.json({
            aggregated,
            siteUrl,
        });
    } catch (error: any) {
        console.error('Error fetching GSC data:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            status: error.status,
            response: error.response?.data,
        });
        return NextResponse.json(
            { error: error.message || 'Failed to fetch GSC data' },
            { status: error.response?.status || 500 }
        );
    }
}