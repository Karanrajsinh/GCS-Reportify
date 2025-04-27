// import { getAuth } from '@clerk/nextjs/server';
// import { NextResponse, NextRequest } from 'next/server';
// import { google } from 'googleapis';

// export async function GET(request: NextRequest) {
//   try {
//     const auth = getAuth(request);
    
//     // Get OAuth token from Clerk
//     const token = await auth.getToken();
    
//     if (!token) {
//       return NextResponse.json(
//         { error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     // Create OAuth2 client
//     const oauth2Client = new google.auth.OAuth2();
//     oauth2Client.setCredentials({ access_token: token });

//     // Initialize Search Console API
//     const searchConsole = google.webmasters({
//       version: 'v3',
//       auth: oauth2Client,
//     });

//     // Fetch sites
//     const { data } = await searchConsole.sites.list();
    
//     // Extract and return the properties
//     return NextResponse.json({
//       properties: data.siteEntry?.map(site => ({
//         siteUrl: site.siteUrl,
//         permissionLevel: site.permissionLevel
//       })) || []
//     });
//   } catch (error: any) {
//     console.error('Error fetching GSC properties:', error);
//     console.error('GSC API Error Details:', error.response?.data || error.message);
//     return NextResponse.json(
//       { error: error.message || 'Failed to fetch GSC properties' },
//       { status: 500 }
//     );
//   }
// }

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';
import { google } from 'googleapis';
import axios from 'axios';

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

    // Get Google OAuth access token from Clerk user session
    let token;
    try {
      const oauthToken = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_google');
      token = oauthToken?.[0]?.token;
      console.log('Clerk OAuth Token:', token ? { tokenLength: token.length, tokenPreview: token.slice(0, 10) + '...' } : 'No OAuth token');
    } catch (oauthError: any) {
      console.error('Clerk OAuth Token Error:', oauthError);
      return NextResponse.json(
        { error: 'Failed to retrieve Google OAuth token from Clerk' },
        { status: 401 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No Google OAuth token available in user session' },
        { status: 401 }
      );
    }

    // Validate token with Google's tokeninfo endpoint
    try {
      const tokenInfo = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
      console.log('Google Token Info:', tokenInfo.data);
      if (!tokenInfo.data.scope?.includes('https://www.googleapis.com/auth/webmasters.readonly')) {
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

    // Fetch sites
    const { data } = await searchConsole.sites.list();
    console.log('GSC Sites Response:', data);

    // Extract and return the properties
    return NextResponse.json({
      properties: data.siteEntry?.map(site => ({
        siteUrl: site.siteUrl,
        permissionLevel: site.permissionLevel,
      })) || [],
    });
  } catch (error: any) {
    console.error('Error fetching GSC properties:', error);
    console.error('GSC API Error Details:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch GSC properties' },
      { status: error.response?.status || 500 }
    );
  }
}