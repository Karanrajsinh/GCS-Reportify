import { prisma } from "@/prisma/prisma";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const { userId } = auth();
    const { reportId } = params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    // Update report name and verify ownership
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