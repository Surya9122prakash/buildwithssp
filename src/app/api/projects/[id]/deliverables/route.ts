import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessProject } from "@/lib/project-access";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id: projectId } = await params;
    if (!(await canAccessProject(projectId, user))) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { name, phase, status } = await request.json();
    if (typeof name !== "string" || !name.trim() || typeof phase !== "string" ||
        (status && !["pending", "approved", "revision"].includes(status))) {
      return NextResponse.json({ error: "Invalid deliverable" }, { status: 400 });
    }
    const deliverable = await prisma.deliverable.create({
      data: { name: name.trim(), phase, status: status || "pending", projectId },
    });
    return NextResponse.json(deliverable, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: projectId } = await params;
    if (!(await canAccessProject(projectId, user))) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { id, status, feedback } = await request.json();
    if (typeof id !== "string" || !["pending", "approved", "revision"].includes(status)) {
      return NextResponse.json({ error: "Invalid deliverable update" }, { status: 400 });
    }
    if (user.role === "client" && !["approved", "revision"].includes(status)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (status === "revision" && (typeof feedback !== "string" || !feedback.trim())) {
      return NextResponse.json({ error: "Revision feedback is required" }, { status: 400 });
    }

    const current = await prisma.deliverable.findFirst({ where: { id, projectId } });
    if (!current) return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
    const updated = await prisma.$transaction(async (tx) => {
      const deliverable = await tx.deliverable.update({
        where: { id }, data: {
          status,
          feedback: status === "revision" ? feedback.trim() : (feedback === null ? null : current.feedback),
        },
      });
      if (user.role === "client") {
        const items = await tx.deliverable.findMany({ where: { projectId } });
        const approved = items.filter(d => d.status === "approved").length;
        const progress = items.length ? Math.round((approved / items.length) * 100) : 0;
        const allApproved = items.length > 0 && approved === items.length;
        await tx.project.update({
          where: { id: projectId },
          data: {
            progress,
            status: status === "revision" ? "Pending Client" : (allApproved ? "On Track" : "In Review"),
            ...(allApproved ? { phase: "Launch" } : (approved >= items.length - 1 && approved > 0 ? { phase: "Testing" } : {})),
          },
        });
      }
      return deliverable;
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
