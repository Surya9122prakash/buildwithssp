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
    const { title, amount, dueDate } = await request.json();
    const numericAmount = Number(amount);
    if (typeof title !== "string" || !title.trim() || !Number.isFinite(numericAmount) || numericAmount < 0) {
      return NextResponse.json({ error: "Invalid invoice" }, { status: 400 });
    }
    const invoice = await prisma.invoice.create({
      data: {
        title: title.trim(), amount: numericAmount, status: "pending",
        dueDate: typeof dueDate === "string" ? dueDate : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        projectId,
      },
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id: projectId } = await params;
    if (!(await canAccessProject(projectId, user))) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { id, status } = await request.json();
    if (typeof id !== "string" || !["paid", "pending", "locked"].includes(status)) {
      return NextResponse.json({ error: "Invalid invoice update" }, { status: 400 });
    }
    const invoice = await prisma.invoice.findFirst({ where: { id, projectId } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    const updated = await prisma.invoice.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
