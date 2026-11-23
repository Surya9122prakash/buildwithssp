import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const briefs = await prisma.brief.findMany({
      where: user.role === "owner" ? {} : { clientId: user.id },
    });
    return NextResponse.json(briefs);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { clientName, projectName, budget, description, clientId } = await request.json();
    const amount = Number(budget);
    if (typeof projectName !== "string" || !projectName.trim() ||
        typeof description !== "string" || !Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid brief details" }, { status: 400 });
    }
    // The client identity is derived from the authenticated session, never from a submitted ID.
    const brief = await prisma.brief.create({
      data: {
        clientName: user.role === "owner" ? (clientName || user.name) : user.name,
        projectName: projectName.trim(),
        budget: amount,
        description,
        status: "pending",
        clientId: user.role === "owner" ? (clientId || null) : user.id,
      },
    });
    return NextResponse.json(brief, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, status } = await request.json();
    if (typeof id !== "string" || !["pending", "approved", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid brief update" }, { status: 400 });
    }
    const brief = await prisma.brief.update({ where: { id }, data: { status } });
    return NextResponse.json(brief);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
