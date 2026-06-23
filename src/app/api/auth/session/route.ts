import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateRedisSession } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activeTab, activeProjectId, selectedClientId } = await request.json();

    const updates: Record<string, string> = {};
    if (activeTab !== undefined) updates.activeTab = activeTab;
    if (activeProjectId !== undefined) updates.activeProjectId = activeProjectId;
    if (selectedClientId !== undefined) updates.selectedClientId = selectedClientId;

    await updateRedisSession(sessionCookie.value, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
