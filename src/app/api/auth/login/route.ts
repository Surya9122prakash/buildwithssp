import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyPassword, createRedisSession, getSessionSettings } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionId = await createRedisSession(user.id);
    const settings = await getSessionSettings();

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        mobile: user.mobile,
        gender: user.gender,
        dob: user.dob,
        profileImage: user.profileImage,
        bio: user.bio,
      },
      settings,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: settings.absoluteTimeout,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login endpoint error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
