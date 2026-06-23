import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const briefs = await prisma.brief.findMany();
    return NextResponse.json(briefs);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientName, projectName, budget, description, clientId } = body;

    const brief = await prisma.brief.create({
      data: {
        clientName: clientName || "Acme Corp",
        projectName,
        budget: Number(budget),
        description,
        status: "pending",
        clientId,
      },
    });

    return NextResponse.json(brief);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    const brief = await prisma.brief.update({
      where: { id },
      data: {
        status,
      },
    });

    return NextResponse.json(brief);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
