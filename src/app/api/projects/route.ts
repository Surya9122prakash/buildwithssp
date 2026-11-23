import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projects = await prisma.project.findMany({
      where: user.role === "owner" ? {} : { clientId: user.id },
      include: { deliverables: true, invoices: true, meetings: true },
    });
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, description, status, progress, phase, deliverables, invoices, clientId } = await request.json();
    if (typeof name !== "string" || !name.trim() || typeof description !== "string") {
      return NextResponse.json({ error: "Invalid project details" }, { status: 400 });
    }
    if (clientId !== undefined && clientId !== null) {
      const client = await prisma.user.findFirst({ where: { id: clientId, role: "client" }, select: { id: true } });
      if (!client) return NextResponse.json({ error: "Invalid client" }, { status: 400 });
    }
    const validStatus = ["On Track", "In Review", "Pending Client", "Delayed"];
    const validPhase = ["Discovery", "Design", "Development", "Testing", "Launch"];
    const numericProgress = Number(progress ?? 0);
    if ((status && !validStatus.includes(status)) || (phase && !validPhase.includes(phase)) ||
        !Number.isInteger(numericProgress) || numericProgress < 0 || numericProgress > 100 ||
        (deliverables !== undefined && !Array.isArray(deliverables)) ||
        (invoices !== undefined && !Array.isArray(invoices))) {
      return NextResponse.json({ error: "Invalid project fields" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(), description,
        status: status || "On Track",
        progress: numericProgress,
        phase: phase || "Discovery",
        clientId: clientId || null,
        deliverables: { create: deliverables || [] },
        invoices: { create: invoices || [] },
      },
      include: { deliverables: true, invoices: true, meetings: true },
    });
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
