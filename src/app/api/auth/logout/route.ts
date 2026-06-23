import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteRedisSession } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (sessionCookie && sessionCookie.value) {
      await deleteRedisSession(sessionCookie.value);
    }

    cookieStore.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
