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
    const meetings = await prisma.meeting.findMany({
      where: { projectId },
    });
    return NextResponse.json(meetings);
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
    const { clientName, date, time, topic, duration } = body;

    const meetingCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    const link = `https://meet.google.com/${meetingCode}`;

    const meeting = await prisma.meeting.create({
      data: {
        clientName: clientName || "Client",
        date,
        time,
        topic,
        duration: duration || "30 mins",
        link,
        projectId,
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
