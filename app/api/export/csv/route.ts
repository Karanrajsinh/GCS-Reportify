import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { data, filename = 'gsc-report.csv' } = await request.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data for CSV export' },
        { status: 400 }
      );
    }

    // The actual CSV generation is handled client-side using Papaparse
    // This endpoint just validates the request
    
    return NextResponse.json({
      success: true,
      message: 'CSV export request validated',
      rowCount: data.length,
      filename
    });
  } catch (error: any) {
    console.error('Error in CSV export endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process CSV export' },
      { status: 500 }
    );
  }
}