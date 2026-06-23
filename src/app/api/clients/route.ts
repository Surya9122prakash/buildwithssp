import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await prisma.user.findMany({
      where: { role: "client" },
      select: {
        id: true,
        email: true,
        name: true,
        mobile: true,
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
