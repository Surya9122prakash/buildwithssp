import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filter = user.role === "client" ? { clientId: user.id } : {};
    const projects = await prisma.project.findMany({
      where: filter,
      include: {
        deliverables: true,
        invoices: true,
        meetings: true,
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, status, progress, phase, deliverables, invoices, clientId } = body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || "On Track",
        progress: progress || 0,
        phase: phase || "Discovery",
        clientId,
        deliverables: {
          create: deliverables || [],
        },
        invoices: {
          create: invoices || [],
        },
      },
      include: {
        deliverables: true,
        invoices: true,
        meetings: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
