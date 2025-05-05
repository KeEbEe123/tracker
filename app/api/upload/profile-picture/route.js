import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";
import { deleteFileFromServer } from "@/utils/file-utils";

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
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload JPEG, PNG, WEBP, or GIF.",
        },
        { status: 400 }
      );
    }

    // Define upload path - use the public directory in project root
    const baseUploadDir = path.join(process.cwd(), "public", "uploads");
    const profilesUploadDir = path.join(baseUploadDir, "profiles");

    // Ensure folders exist
    if (!existsSync(baseUploadDir)) {
      await mkdir(baseUploadDir, { recursive: true });
    }
    if (!existsSync(profilesUploadDir)) {
      await mkdir(profilesUploadDir, { recursive: true });
    }

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.type.split("/")[1];
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(profilesUploadDir, fileName);
    await writeFile(filePath, buffer);

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
