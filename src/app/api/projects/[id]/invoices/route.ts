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
    const { title, amount, dueDate } = body;

    const invoice = await prisma.invoice.create({
      data: {
        title,
        amount: Number(amount),
        status: "pending",
        dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        projectId,
      },
    });

    return NextResponse.json(invoice);
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
    const { id, status } = body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
