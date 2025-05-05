import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// POST /api/upload - Upload a file (for certifications)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP and PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    // Check file size (5MB limit)
    const sizeInBytes = file.size;
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (sizeInBytes > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists with certifications subfolder
    const baseUploadDir = path.join(process.cwd(), "public/uploads");
    const certificationsUploadDir = path.join(baseUploadDir, "certifications");

    // Create base uploads directory if it doesn't exist
    if (!existsSync(baseUploadDir)) {
      await mkdir(baseUploadDir, { recursive: true });
    }

    // Create certifications subdirectory if it doesn't exist
    if (!existsSync(certificationsUploadDir)) {
      await mkdir(certificationsUploadDir, { recursive: true });
    }

    // Generate unique filename
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension =
      file.type.split("/")[1] === "pdf"
        ? ".pdf"
        : `.${file.type.split("/")[1]}`;
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(certificationsUploadDir, filename);

    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      console.error("Error saving file:", error);
      return NextResponse.json({ error: "Error saving file" }, { status: 500 });
    }

    // Return the URL for the uploaded file
    return NextResponse.json({
      url: `/uploads/certifications/${filename}`,
      filename: filename,
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
