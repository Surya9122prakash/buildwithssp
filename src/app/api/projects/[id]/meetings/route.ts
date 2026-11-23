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
    return NextResponse.json(await prisma.meeting.findMany({ where: { projectId } }));
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
    const { date, time, topic, duration, link } = await request.json();
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        typeof time !== "string" || !/^\d{1,2}:\d{2}/.test(time) ||
        typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Invalid meeting details" }, { status: 400 });
    }
    if (link !== undefined && link !== null && user.role !== "owner") {
      return NextResponse.json({ error: "Only the owner can set a meeting link" }, { status: 403 });
    }
    if (link && (typeof link !== "string" || !/^https:\/\/(meet\.google\.com|zoom\.us|teams\.microsoft\.com)\//i.test(link))) {
      return NextResponse.json({ error: "Invalid meeting URL" }, { status: 400 });
    }
    // A real meeting invitation must be created and shared separately.
    // A generic /new link is not a meeting that both parties can join.
    const meeting = await prisma.meeting.create({
      data: {
        clientName: user.name, date, time, topic: topic.trim(),
        duration: typeof duration === "string" ? duration : "30 mins",
        link: link || null, projectId,
      },
    });
    return NextResponse.json(meeting, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
