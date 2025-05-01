import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

// POST /api/teacher/certifications - Add a new certification
export async function POST(request) {
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

    // Validate required fields
    if (!data.name || !data.issuingOrganization || !data.issueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add new certification
    teacher.certifications.push({
      name: data.name,
      issuingOrganization: data.issuingOrganization,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate || null,
      credentialId: data.credentialId || null,
      credentialUrl: data.credentialUrl || null,
    });

    await teacher.save();

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error adding certification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
