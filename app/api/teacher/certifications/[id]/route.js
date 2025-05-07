import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";
import { deleteFileFromServer } from "@/utils/file-utils";

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

    // Store the old image URL to delete if it's changing
    const oldImageUrl = teacher.certifications[certIndex].imageUrl;
    const isImageChanging = data.imageUrl && oldImageUrl !== data.imageUrl;

    // Update certification fields
    const updatedCert = {
      ...teacher.certifications[certIndex],
      name: data.name,
      issuingOrganization: data.issuingOrganization,
      issueDate: data.issueDate,
      credentialId: data.credentialId || null,
      credentialUrl: data.credentialUrl || null,
      imageUrl: data.imageUrl,
    };

    // If type is provided, update it and recalculate points
    if (typeof data.type === "string") {
      updatedCert.type = data.type;
      // Points map must match the model
      const pointsMap = {
        fdp: 5,
        global: 10,
        webinar: 3,
        online: 8,
        other: 2,
      };
      updatedCert.points = pointsMap[data.type] || 2;
    } else if (!updatedCert.type) {
      // If type is missing, set to 'other' and points to 2
      updatedCert.type = "other";
      updatedCert.points = 2;
    }

    teacher.certifications[certIndex] = updatedCert;
    await teacher.save();

    // Delete the old image if it was changed and is an uploaded file
    if (isImageChanging && oldImageUrl && oldImageUrl.startsWith("/uploads/")) {
      await deleteFileFromServer(oldImageUrl);
    }

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

    // Find the certification to get its image URL before removing
    const certification = teacher.certifications.find(
      (cert) => cert._id.toString() === certId
    );

    // Store the image URL to delete
    const imageUrl = certification ? certification.imageUrl : null;

    // Remove the certification
    teacher.certifications = teacher.certifications.filter(
      (cert) => cert._id.toString() !== certId
    );

    await teacher.save();

    // Delete the image file if it exists and is an uploaded file
    if (imageUrl && imageUrl.startsWith("/uploads/")) {
      await deleteFileFromServer(imageUrl);
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
