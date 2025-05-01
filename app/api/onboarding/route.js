import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const TeacherModel = await getTeacherModel();

    // Check if teacher already exists
    const existingTeacher = await TeacherModel.findOne({
      userId: session.user.id,
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: "Teacher profile already exists" },
        { status: 409 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.contactNumber || !data.department) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new teacher profile
    const newTeacher = new TeacherModel({
      userId: session.user.id,
      name: data.name,
      email: session.user.email,
      contactNumber: data.contactNumber,
      department: data.department,
      profilePicture: session.user.image || null,
      certifications: [],
    });

    await newTeacher.save();

    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
