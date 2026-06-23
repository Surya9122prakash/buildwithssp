import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getSessionSettings, saveSessionSettings } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await getSessionSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { idleTimeout, warningDuration, absoluteTimeout } = body;

    const updates: Record<string, number> = {};
    if (idleTimeout !== undefined) updates.idleTimeout = Number(idleTimeout);
    if (warningDuration !== undefined) updates.warningDuration = Number(warningDuration);
    if (absoluteTimeout !== undefined) updates.absoluteTimeout = Number(absoluteTimeout);

    const updated = await saveSessionSettings(updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
