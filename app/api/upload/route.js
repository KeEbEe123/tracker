import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Define base storage path outside of application directory
const EXTERNAL_STORAGE_PATH =
  process.env.EXTERNAL_STORAGE_PATH || "/home/ubuntu/persistent-storage";

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
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, JPG, and PNG files are allowed.",
        },
        { status: 400 }
      );
    }

    // Check file size (5MB limit)
    const sizeInBytes = file.size;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (sizeInBytes > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Create external uploads directory structure
    const uploadsDir = path.join(EXTERNAL_STORAGE_PATH, "uploads");
    const certificationsDir = path.join(uploadsDir, "certifications");

    // Create directories if they don't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    if (!existsSync(certificationsDir)) {
      await mkdir(certificationsDir, { recursive: true });
    }

    // Create symbolic link in public directory if it doesn't exist
    // This ensures Next.js can serve these files statically
    const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
    const publicCertificationsDir = path.join(
      publicUploadsDir,
      "certifications"
    );

    if (!existsSync(publicUploadsDir)) {
      await mkdir(publicUploadsDir, { recursive: true });
    }

    // In production, we'll need to create a symlink to the external storage
    // In development, we'll just save directly to public
    if (process.env.NODE_ENV === "production") {
      // Note: Creating symbolic links requires additional setup in production
      console.log(
        `In production: External storage path is ${certificationsDir}`
      );
      console.log(
        `Ensure there's a symlink from ${publicCertificationsDir} to ${certificationsDir}`
      );
    } else if (!existsSync(publicCertificationsDir)) {
      await mkdir(publicCertificationsDir, { recursive: true });
    }

    // Generate file name and path
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.type.split("/")[1];
    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(certificationsDir, filename);

    // Write file to disk
    try {
      await writeFile(filePath, buffer);

      // In development mode, also save to public directory for testing
      if (process.env.NODE_ENV !== "production") {
        const publicFilePath = path.join(publicCertificationsDir, filename);
        await writeFile(publicFilePath, buffer);
      }
    } catch (error) {
      console.error("Error saving file:", error);
      return NextResponse.json({ error: "Error saving file" }, { status: 500 });
    }

    // Set the URL path for browser access (relative to public directory)
    const fileUrl = `/uploads/certifications/${filename}`;

    // Return public URL
    return NextResponse.json({
      url: fileUrl,
      filename,
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
