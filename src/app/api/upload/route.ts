import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType, fileSize, category } = await request.json();
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    if (fileSize) {
      const maxLimit = category === "profile" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
      if (fileSize > maxLimit) {
        return NextResponse.json(
          { error: `File size exceeds the allowed limit of ${maxLimit / (1024 * 1024)}MB` },
          { status: 400 }
        );
      }
    }

    // Sanitize and generate unique safe filename
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const safeFilename = `${Date.now()}-${sanitizedName}`;

    const bucket = process.env.R2_BUCKET || "default-bucket";
    const devUrl = process.env.R2_DEV_URL || "http://localhost:3000/uploads";

    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: bucket,
        Key: safeFilename,
        ContentType: fileType,
      }),
      { expiresIn: 60 }
    );

    const fileUrl = `${devUrl}/${safeFilename}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      fileName: safeFilename,
    });
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
