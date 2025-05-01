import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

// GET /api/teacher/[email] - Get a teacher profile by email
export async function GET(request, context) {
  try {
    // Properly extract email from params in Next.js App Router
    const email = context.params.email;

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

    // Only return basic profile info to verify onboarding
    return NextResponse.json({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
    });
  } catch (error) {
    console.error("Error fetching teacher by email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
