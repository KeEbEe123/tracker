// app/api/migrate-certification-types/route.js
import { NextResponse } from "next/server";
import { getTeacherModel } from "@/models/Teacher";
import connectDB from "@/lib/mongoose";

export async function GET() {
  try {
    await connectDB();
    const Teacher = await getTeacherModel();

    const teachers = await Teacher.find({});
    let totalUpdated = 0;

    for (const teacher of teachers) {
      let updated = false;

      teacher.certifications = teacher.certifications.map((cert) => {
        if (!cert.type) {
          cert.type = "other"; // ✅ Default type for old records
          updated = true;
        }
        return cert;
      });

      if (updated) {
        teacher.markModified("certifications");
        await teacher.save();
        totalUpdated++;
      }
    }

    return NextResponse.json({
      message: `✅ Migration completed`,
      totalUsersChecked: teachers.length,
      totalUsersUpdated: totalUpdated,
    });
  } catch (error) {
    console.error("❌ Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}
