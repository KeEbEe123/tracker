import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

// GET /api/teacher - Get the current user's teacher profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log("No authenticated session found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("Looking up teacher for user ID:", session.user.id);

    const TeacherModel = await getTeacherModel();
    const teacher = await TeacherModel.findOne({ userId: session.user.id });

    if (!teacher) {
      console.log("No teacher found for user ID:", session.user.id);
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/teacher - Update the current user's teacher profile
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await request.json();
    const TeacherModel = await getTeacherModel();

    const teacher = await TeacherModel.findOne({ userId: session.user.id });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (data.name) teacher.name = data.name;
    if (data.contactNumber) teacher.contactNumber = data.contactNumber;
    if (data.department) teacher.department = data.department;

    await teacher.save();

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
