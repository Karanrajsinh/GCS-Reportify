import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';
import { google } from 'googleapis';

// Cache timeout of 5 minutes
const CACHE_MAX_AGE = 300;

interface GSCSiteEntry {
  siteUrl: string;
  permissionLevel: string;
}

interface GSCResponse {
  siteEntry?: GSCSiteEntry[];
}

/**
 * Fetches GSC properties for the authenticated user.
 * @param request - Next.js request object
 * @returns JSON response with GSC properties or error
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get Google OAuth access token with timeout
    let token: string;
    try {
      const oauthToken = await Promise.race([
        clerkClient.users.getUserOauthAccessToken(userId, 'oauth_google'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Token fetch timeout')), 5000)
        )
      ]) as Awaited<ReturnType<typeof clerkClient.users.getUserOauthAccessToken>>;

      token = oauthToken?.[0]?.token;
      if (!token) throw new Error('No OAuth token available');
    } catch (oauthError: any) {
      console.error('OAuth Token Error:', oauthError);
      return NextResponse.json(
        { error: 'Failed to retrieve Google OAuth token' },
        { status: 401 }
      );
    }

    // Initialize Search Console API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const searchConsole = google.webmasters({
      version: 'v3',
      auth: oauth2Client
    });

    // Fetch sites with timeout
    const result = await Promise.race([
      searchConsole.sites.list(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('GSC API timeout')), 5000)
      )
    ]) as { data: GSCResponse };

    // Prepare response with cache headers
    const response = NextResponse.json({
      properties: result.data.siteEntry?.map((site: GSCSiteEntry) => ({
        siteUrl: site.siteUrl,
        permissionLevel: site.permissionLevel,
      })) || [],
    });

    // Add cache headers
    response.headers.set('Cache-Control', `private, max-age=${CACHE_MAX_AGE}`);
    response.headers.set('Expires', new Date(Date.now() + CACHE_MAX_AGE * 1000).toUTCString());

    return response;

  } catch (error: any) {
    console.error('Error fetching GSC properties:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch GSC properties' },
      { status: error.response?.status || 500 }
    );
  }
}