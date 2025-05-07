import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

// GET: Get a teacher by email
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email } = params;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const decodedEmail = decodeURIComponent(email);

    const TeacherModel = await getTeacherModel();
    const teacher = await TeacherModel.findOne({ email: decodedEmail });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
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

// PATCH: Update a specific teacher's data
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get teacherId from the URL
    const { id: teacherId } = params;
    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Get update data from request body
    const updateData = await request.json();

    // Validate update data - only allow specific fields to be updated
    const allowedFields = ["improvementRate", "recentAchievement"];
    const filteredUpdate = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(filteredUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the teacher in the database
    const TeacherModel = await getTeacherModel();
    const updatedTeacher = await TeacherModel.findByIdAndUpdate(
      teacherId,
      { $set: filteredUpdate },
      { new: true } // Return the updated document
    );

    if (!updatedTeacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
