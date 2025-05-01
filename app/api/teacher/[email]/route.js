import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

// GET /api/teacher/[email] - Get a teacher profile by email
export async function GET(request, { params }) {
  try {
    // Properly decode the email from URL-safe format
    const email = decodeURIComponent(params.email);

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const TeacherModel = await getTeacherModel();
    const teacher = await TeacherModel.findOne({ email: email });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Return complete teacher data
    return NextResponse.json({
      id: teacher._id,
      userId: teacher.userId,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      contactNumber: teacher.contactNumber,
      profilePicture: teacher.profilePicture,
      certifications: teacher.certifications,
      totalPoints: teacher.totalPoints,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching teacher by email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
