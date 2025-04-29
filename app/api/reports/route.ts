import { prisma } from "@/prisma/prisma";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    console.log('Creating report for user:', userId);

    const body = await req.json();
    console.log('Request body:', body);
    
    const { name, websiteUrl } = body;

    if (!name || !websiteUrl) {
      console.error('Missing required fields:', { name, websiteUrl });
      return NextResponse.json(
        { message: "Name and website URL are required" },
        { status: 400 }
      );
    }

    // Create the report with user relationship
    console.log('Creating report for user:', userId);
    const report = await prisma.report.create({
      data: {
        name: name,
        property: websiteUrl,
        user: {
          connect: {
            id: userId!
          }
        }
      },
      include: {
        user: true
      }
    });
    console.log('Created report:', report);

    return NextResponse.json(report);
  } catch (error) {
    console.error("[REPORTS_POST] Detailed error:", error);
    return NextResponse.json(
      { message: "Failed to create report", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const property = searchParams.get("website");
    console.log('Fetching reports for property:', property);

    if (!property) {
      console.error('Missing property parameter');
      return NextResponse.json(
        { message: "Property URL is required" },
        { status: 400 }
      );
    }

    // Find reports for this user and property
    const reports = await prisma.report.findMany({
      where: {
        property: property,
        user: {
          id: userId!
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    });
    console.log('Found reports:', reports.length);

    return NextResponse.json(reports);
  } catch (error) {
    console.error("[REPORTS_GET] Detailed error:", error);
    return NextResponse.json(
      { message: "Failed to fetch reports", error: (error as Error).message },
      { status: 500 }
    );
  }
}