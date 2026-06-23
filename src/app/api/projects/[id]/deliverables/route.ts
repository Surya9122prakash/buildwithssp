import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { name, phase, status } = body;

    const deliverable = await prisma.deliverable.create({
      data: {
        name,
        phase,
        status: status || "pending",
        projectId,
      },
    });

    return NextResponse.json(deliverable);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, feedback } = body;

    const deliverable = await prisma.deliverable.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        feedback: feedback === null ? null : (feedback !== undefined ? feedback : undefined),
      },
    });

    return NextResponse.json(deliverable);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
