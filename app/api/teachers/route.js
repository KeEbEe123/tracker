import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const TeacherModel = await getTeacherModel();

    // Fetch all teachers with their certifications
    const teachers = await TeacherModel.find({}).sort({ totalPoints: -1 });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const ADMIN_EMAILS = [
      "siddhartht4206@gmail.com",
      "23r21a12b3@mlrit.ac.in",
      "23r21a1285@mlrit.ac.in",
    ];
    if (!session || !session.user || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const TeacherModel = await getTeacherModel();
    const teachers = await TeacherModel.find({}).sort({ totalPoints: -1 });

    // Fix certificates with no type: set points to 0 for those
    let updatedCerts = 0;
    let updatedTeachers = 0;
    let checkedCerts = 0;
    console.log(`Found ${teachers.length} teachers in update ranks endpoint.`);
    for (const teacher of teachers) {
      let changed = false;
      if (Array.isArray(teacher.certifications)) {
        teacher.certifications.forEach((cert) => {
          checkedCerts++;
          if (cert) {
            if (cert.points === undefined || cert.points === null) {
              cert.points = 0;
              changed = true;
            }
            if (!cert.type || cert.type === '') {
              cert.points = 0;
              changed = true;
              updatedCerts++;
            }
          }
        });
      }
      try {
        await teacher.save(); // always recalc points
        if (changed) updatedTeachers++;
      } catch (err) {
        console.error("Failed to save teacher in update ranks:", teacher._id, teacher.email, err);
      }
    }
    console.log(`Checked ${checkedCerts} certificates across ${teachers.length} teachers. Updated ${updatedCerts} certificates in ${updatedTeachers} teachers.`);

    // Recalculate totalPoints for all teachers
    for (const teacher of teachers) {
      await teacher.save(); // triggers pre-save middleware
    }

    try {
      if (teachers.length > 0) {
        const bulkOps = teachers.map((teacher, i) => ({
          updateOne: {
            filter: { _id: teacher._id },
            update: { $set: { rank: i + 1 } }
          }
        }));
        await TeacherModel.bulkWrite(bulkOps);
      }
      return NextResponse.json({ message: "Ranks updated and certificates fixed", count: teachers.length, updatedTeachers, updatedCerts, teachersChecked: teachers.length, certsChecked: checkedCerts });
    } catch (error) {
      console.error("Error updating ranks:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating ranks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
