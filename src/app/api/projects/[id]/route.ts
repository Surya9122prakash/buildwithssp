import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, progress, phase } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(progress !== undefined && { progress }),
        ...(phase !== undefined && { phase }),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
