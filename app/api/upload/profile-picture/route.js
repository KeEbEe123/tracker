import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";
import { deleteFileFromServer } from "@/utils/file-utils";

// Define base storage path outside of application directory
const EXTERNAL_STORAGE_PATH =
  process.env.EXTERNAL_STORAGE_PATH || "/home/ubuntu/persistent-storage";

export async function POST(request) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get teacher
    const TeacherModel = await getTeacherModel();
    const teacher = await TeacherModel.findOne({ userId: session.user.id });
    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    const oldProfilePictureUrl = teacher.profilePicture;

    // Get uploaded file
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // File size check
    const sizeInBytes = file.size;
    const maxSize = 5 * 1024 * 1024;
    if (sizeInBytes > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Type check
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Unsupported file type. Please upload JPEG, JPG, or PNG only.",
        },
        { status: 400 }
      );
    }

    // Create external uploads directory structure
    const uploadsDir = path.join(EXTERNAL_STORAGE_PATH, "uploads");
    const profilesDir = path.join(uploadsDir, "profiles");

    // Create directories if they don't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    if (!existsSync(profilesDir)) {
      await mkdir(profilesDir, { recursive: true });
    }

    // Create symbolic link in public directory if it doesn't exist
    // This ensures Next.js can serve these files statically
    const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
    const publicProfilesDir = path.join(publicUploadsDir, "profiles");

    if (!existsSync(publicUploadsDir)) {
      await mkdir(publicUploadsDir, { recursive: true });
    }

    // In production, we'll need to create a symlink to the external storage
    // In development, we'll just save directly to public
    if (process.env.NODE_ENV === "production") {
      // Note: Creating symbolic links requires additional setup in production
      console.log(`In production: External storage path is ${profilesDir}`);
      console.log(
        `Ensure there's a symlink from ${publicProfilesDir} to ${profilesDir}`
      );
    } else if (!existsSync(publicProfilesDir)) {
      await mkdir(publicProfilesDir, { recursive: true });
    }

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.type.split("/")[1];
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(profilesDir, fileName);
    await writeFile(filePath, buffer);

    // In development mode, also save to public directory for testing
    if (process.env.NODE_ENV !== "production") {
      const publicFilePath = path.join(publicProfilesDir, fileName);
      await writeFile(publicFilePath, buffer);
    }

    // Set the URL path for browser access (relative to public directory)
    const fileUrl = `/uploads/profiles/${fileName}`;

    // Update teacher
    teacher.profilePicture = fileUrl;
    await teacher.save();

    // Delete old file if custom
    if (
      oldProfilePictureUrl &&
      oldProfilePictureUrl.startsWith("/uploads/") &&
      !oldProfilePictureUrl.includes("placeholder")
    ) {
      await deleteFileFromServer(oldProfilePictureUrl);
    }

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Error in profile picture upload:", error);
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}
