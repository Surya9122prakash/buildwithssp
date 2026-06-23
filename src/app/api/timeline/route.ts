import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.timelineItem.findMany({
      orderBy: {
        order: "asc"
      }
    });

    const parsedItems = items.map(item => ({
      ...item,
      details: JSON.parse(item.details),
      tags: JSON.parse(item.tags)
    }));

    return NextResponse.json(parsedItems);
  } catch (error) {
    console.error("Failed to fetch timeline items:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
