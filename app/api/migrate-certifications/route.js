import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

// POST /api/migrate-certifications - Standardize credential fields for existing certifications
export async function POST(request) {
  try {
    // Verify admin authorization (you can customize this based on your auth setup)
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Only allow certain admin emails to run this migration
    const adminEmails = ["23r21a1285@mlrit.ac.in"]; // Replace with actual admin emails
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const TeacherModel = await getTeacherModel();
    const teachers = await TeacherModel.find({});

    let updatedCount = 0;
    let teacherCount = 0;
    let certCount = 0;

    // Process each teacher
    for (const teacher of teachers) {
      let teacherUpdated = false;
      teacherCount++;

      if (teacher.certifications && teacher.certifications.length > 0) {
        // Process each certification
        for (let i = 0; i < teacher.certifications.length; i++) {
          certCount++;
          const cert = teacher.certifications[i];

          // Check if credentialId or credentialUrl needs standardization
          // Convert empty strings to null and keep existing nulls as is
          if (cert.credentialId === "" || cert.credentialUrl === "") {
            teacher.certifications[i] = {
              ...cert,
              credentialId: cert.credentialId || null,
              credentialUrl: cert.credentialUrl || null,
            };
            teacherUpdated = true;
          }
        }

        // Save the teacher if updates were made
        if (teacherUpdated) {
          await teacher.save();
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      stats: {
        teachersProcessed: teacherCount,
        certificationsProcessed: certCount,
        teachersUpdated: updatedCount,
      },
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
