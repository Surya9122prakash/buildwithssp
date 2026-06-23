import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, verifyPassword, hashPassword } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      mobile,
      gender,
      dob,
      profileImage,
      bio,
      currentPassword,
      newPassword,
    } = body;

    // Validate name and email
    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    if (email !== undefined && !email.trim()) {
      return NextResponse.json({ error: "Email cannot be empty" }, { status: 400 });
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (mobile !== undefined) updateData.mobile = mobile ? mobile.trim() : null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (dob !== undefined) updateData.dob = dob || null;
    if (profileImage !== undefined) updateData.profileImage = profileImage || null;
    if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;

    // Handle email change
    if (email !== undefined && email.trim() !== user.email) {
      const targetEmail = email.trim();
      const existingUser = await prisma.user.findUnique({
        where: { email: targetEmail },
      });
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: "Email is already taken by another user" },
          { status: 400 }
        );
      }
      updateData.email = targetEmail;
    }

    // Handle password change
    if (newPassword !== undefined && newPassword.trim() !== "") {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }

      const isCurrentPasswordCorrect = verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordCorrect) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 400 }
        );
      }

      updateData.password = hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        mobile: updatedUser.mobile,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
