import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

// PATCH /api/teacher/certifications/[id] - Update a certification
export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const certId = context.params.id;
    const data = await request.json();
    const TeacherModel = await getTeacherModel();

    const teacher = await TeacherModel.findOne({ userId: session.user.id });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Find and update the certification
    const certIndex = teacher.certifications.findIndex(
      (cert) => cert._id.toString() === certId
    );

    if (certIndex === -1) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // Update certification fields
    teacher.certifications[certIndex] = {
      ...teacher.certifications[certIndex],
      name: data.name,
      issuingOrganization: data.issuingOrganization,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate || null,
      credentialId: data.credentialId,
      credentialUrl: data.credentialUrl,
      imageUrl: data.imageUrl,
    };

    await teacher.save();

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error updating certification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/certifications/[id] - Delete a certification
export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const certId = context.params.id;
    const TeacherModel = await getTeacherModel();

    const teacher = await TeacherModel.findOne({ userId: session.user.id });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Remove the certification
    teacher.certifications = teacher.certifications.filter(
      (cert) => cert._id.toString() !== certId
    );

    await teacher.save();

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 