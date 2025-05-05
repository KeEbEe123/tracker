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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get teacher from database
    const TeacherModel = await getTeacherModel();
    const teacher = await TeacherModel.findOne({ userId: session.user.id });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Store the old profile picture URL to delete later
    const oldProfilePictureUrl = teacher.profilePicture;

    // Process the file upload
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
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

    // Check file type
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
            "Unsupported file type. Please upload an image (JPEG, PNG, WEBP, or GIF)",
        },
        { status: 400 }
      );
    }

    // Ensure upload directory exists with profiles subfolder
    const baseUploadDir = path.join(process.cwd(), "public/uploads");
    const profilesUploadDir = path.join(baseUploadDir, "profiles");

    // Create base uploads directory if it doesn't exist
    if (!existsSync(baseUploadDir)) {
      await mkdir(baseUploadDir, { recursive: true });
    }

    // Create profiles subdirectory if it doesn't exist
    if (!existsSync(profilesUploadDir)) {
      await mkdir(profilesUploadDir, { recursive: true });
    }

    // Create an unique filename
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.type.split("/")[1];
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(profilesUploadDir, fileName);

    // Write the file to disk
    await writeFile(filePath, buffer);

    // Create the URL for the image (path relative to public folder)
    const fileUrl = `/uploads/profiles/${fileName}`;

    // Update the teacher profile with the new image URL
    teacher.profilePicture = fileUrl;
    await teacher.save();

    // Delete the old profile picture if it exists and isn't a default image
    if (
      oldProfilePictureUrl &&
      oldProfilePictureUrl.startsWith("/uploads/") &&
      !oldProfilePictureUrl.includes("placeholder")
    ) {
      await deleteFileFromServer(oldProfilePictureUrl);
    }

    // Return success response with the URL
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Error in profile picture upload:", error);
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}
