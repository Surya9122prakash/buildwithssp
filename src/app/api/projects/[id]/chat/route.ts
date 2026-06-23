import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const messages = await prisma.message.findMany({
      where: { projectId },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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
    const { sender, text, time, fileUrl, fileName } = body;

    const message = await prisma.message.create({
      data: {
        sender,
        text,
        time: time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fileUrl,
        fileName,
        projectId,
      },
    });

    return NextResponse.json(message);
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
    const { messageId, text, reactions } = body;

    if (!messageId) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (text !== undefined) {
      // Ensure only the original sender can edit their message text
      const userSenderType = user.role === "owner" ? "owner" : "client";
      if (existingMessage.sender !== userSenderType) {
        return NextResponse.json({ error: "Cannot edit someone else's message" }, { status: 403 });
      }
      updateData.text = text;
      updateData.edited = true;
    }

    if (reactions !== undefined) {
      updateData.reactions = reactions;
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: updateData,
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
