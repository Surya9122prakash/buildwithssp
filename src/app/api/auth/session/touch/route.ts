import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRedisSession, touchRedisSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionData = await getRedisSession(sessionCookie.value);
    if (!sessionData) {
      // Clear cookie if expired on Redis
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      response.cookies.delete("session");
      return response;
    }

    await touchRedisSession(sessionCookie.value, sessionData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session touch endpoint error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
