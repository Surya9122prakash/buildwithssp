import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessProject } from "@/lib/project-access";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!(await canAccessProject(id, user))) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only the owner can manually change project status, phase, or progress.
    // Client deliverable approvals are handled atomically in the deliverable endpoint.
    if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { status, progress, phase } = await request.json();
    const validStatus = ["On Track", "In Review", "Pending Client", "Delayed"];
    const validPhase = ["Discovery", "Design", "Development", "Testing", "Launch"];
    if ((status !== undefined && !validStatus.includes(status)) ||
        (phase !== undefined && !validPhase.includes(phase)) ||
        (progress !== undefined && (!Number.isInteger(progress) || progress < 0 || progress > 100))) {
      return NextResponse.json({ error: "Invalid project update" }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(progress !== undefined && { progress }),
        ...(phase !== undefined && { phase }),
      },
    });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
