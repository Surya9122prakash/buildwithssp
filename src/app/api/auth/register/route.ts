import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { hashPassword, createRedisSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    if (role !== "client") {
      return NextResponse.json(
        { error: "Only client registration is allowed" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    const sessionId = await createRedisSession(user.id);

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
