import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessProject } from "@/lib/project-access";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: projectId } = await params;
    if (!(await canAccessProject(projectId, user))) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const messages = await prisma.message.findMany({ where: { projectId } });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: projectId } = await params;
    if (!(await canAccessProject(projectId, user))) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { sender, text, time, fileUrl, fileName } = await request.json();
    // System notices can only be emitted by the owner. Other sender roles
    // are determined by the session, not arbitrary user input.
    if (sender === "system" && user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if ((typeof text !== "string" || !text.trim()) &&
        (typeof fileUrl !== "string" || !fileUrl.trim())) {
      return NextResponse.json({ error: "Message or attachment required" }, { status: 400 });
    }
    const message = await prisma.message.create({
      data: {
        sender: sender === "system" ? "system" : user.role,
        text: typeof text === "string" ? text.slice(0, 10000) : "",
        time: typeof time === "string" ? time : new Date().toISOString(),
        fileUrl: typeof fileUrl === "string" ? fileUrl : null,
        fileName: typeof fileName === "string" ? fileName : null,
        projectId,
      },
    });
    return NextResponse.json(message, { status: 201 });
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
    const { messageId, text, reactions } = await request.json();
    if (typeof messageId !== "string") return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    const existing = await prisma.message.findFirst({ where: { id: messageId, projectId } });
    if (!existing) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    if (text === undefined && reactions === undefined) {
      return NextResponse.json({ error: "No changes supplied" }, { status: 400 });
    }
    if (text !== undefined && (existing.sender !== user.role || typeof text !== "string" || !text.trim())) {
      return NextResponse.json({ error: "Cannot edit this message" }, { status: 403 });
    }
    if (reactions !== undefined && (typeof reactions !== "string" || reactions.length > 2000)) {
      return NextResponse.json({ error: "Invalid reactions" }, { status: 400 });
    }
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        ...(text !== undefined && { text: text.slice(0, 10000), edited: true }),
        ...(reactions !== undefined && { reactions }),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
