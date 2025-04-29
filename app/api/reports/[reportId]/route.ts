import { prisma } from "@/prisma/prisma";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const { userId } = auth();
    const { reportId } = params;

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
        userId: userId!,
      },
      include: {
        blocks: {
          orderBy: {
            position: 'asc'
          }
        },
        queries: true
      }
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("[REPORT_GET]", error);
    return NextResponse.json(
      { message: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const { userId } = auth();
    const { reportId } = params;
    const { name, tableData, blocks } = await req.json();

    // If tableData or blocks are provided, update them
    if (tableData || blocks) {
      await prisma.$transaction(async (tx) => {
        // Update blocks if provided
        if (blocks) {
          // Delete existing blocks
          await tx.block.deleteMany({
            where: {
              reportId: reportId
            }
          });

          // Insert new blocks
          await tx.block.createMany({
            data: blocks.map((block: any) => ({
              ...block,
              reportId: reportId
            }))
          });
        }

        // Update queries if provided
        if (tableData) {
          // Delete existing queries
          await tx.queryData.deleteMany({
            where: {
              reportId: reportId
            }
          });

          // Insert new queries
          const queries = tableData.map((item: any) => ({
            reportId: reportId,
            query: item.query,
            metrics: item, // Store the entire metrics object
            intent: item.intent || null,
            category: item.category || null
          }));

          await tx.queryData.createMany({
            data: queries
          });
        }
      });

      return NextResponse.json({ message: "Report data updated" });
    }

    // If name is provided, update report name
    if (name) {
      const report = await prisma.report.update({
        where: {
          id: reportId,
          userId: userId!,
        },
        data: {
          name,
        },
      });

      return NextResponse.json(report);
    }

    return NextResponse.json(
      { message: "No valid update data provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[REPORT_PATCH]", error);
    return NextResponse.json(
      { message: "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const { userId } = auth();
    const { reportId } = params;

    // Delete report and verify ownership
    await prisma.report.delete({
      where: {
        id: reportId,
        userId: userId!,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[REPORT_DELETE]", error);
    return NextResponse.json(
      { message: "Failed to delete report" },
      { status: 500 }
    );
  }
}