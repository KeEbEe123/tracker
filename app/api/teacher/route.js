import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

// GET /api/teacher - Get the current user's teacher profile
// or GET /api/teacher?email=user@example.com - Get a teacher profile by email
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log("No authenticated session found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if email parameter is provided in the query
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    const TeacherModel = await getTeacherModel();
    let teacher;

    if (email) {
      // If email is provided, find by email
      console.log("Looking up teacher by email:", email);
      teacher = await TeacherModel.findOne({ email: email });
    } else {
      // Otherwise, get the current user's profile
      console.log("Looking up teacher for user ID:", session.user.id);
      teacher = await TeacherModel.findOne({ userId: session.user.id });
    }

    if (!teacher) {
      const searchParam = email || session.user.id;
      console.log(
        `No teacher found for ${email ? "email" : "user ID"}:`,
        searchParam
      );
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Check for certifications with missing/empty type
    let patchNotes = null;
    if (teacher.certifications && teacher.certifications.some(cert => !cert.type || cert.type === "")) {
      patchNotes = "Some of your certifications are missing a type. Please update them on your profile page.";
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
      patchNotes,
    });
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
    if (data.designation !== undefined) teacher.designation = data.designation;

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
