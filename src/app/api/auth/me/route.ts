import { NextResponse } from "next/server";
import { getSessionWithPreferences, getSessionSettings } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionWithPreferences();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, preferences } = session;
    const settings = await getSessionSettings();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mobile: user.mobile,
        gender: user.gender,
        dob: user.dob,
        profileImage: user.profileImage,
        bio: user.bio,
      },
      preferences,
      settings,
    });
  } catch (error) {
    console.error("Fetch current user session error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
