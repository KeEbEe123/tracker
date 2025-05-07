import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const ADMIN_EMAILS = [
      "siddhartht4206@gmail.com",
      "23r21a12b3@mlrit.ac.in",
      "23r21a1285@mlrit.ac.in",
      "drrajasekhar@mlrinstitutions.ac.in",
    ];
    if (!session || !session.user || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const TeacherModel = await getTeacherModel();
    const teachers = await TeacherModel.find({});
    console.log(`Found ${teachers.length} teachers in update-certificates endpoint.`);
    let updatedCerts = 0;
    let updatedTeachers = 0;
    let checkedCerts = 0;

    if (teachers.length === 0) {
      console.log("No teachers found in the database.");
    }

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
            if (!cert.type || cert.type === "") {
              cert.points = 0;
              changed = true;
              updatedCerts++;
            }
          }
        });
      }
      if (changed) {
        try {
          await teacher.save();
          updatedTeachers++;
        } catch (err) {
          console.error("Failed to save teacher while fixing certificates:", teacher._id, teacher.email, err);
        }
      }
    }

    console.log(`Checked ${checkedCerts} certificates across ${teachers.length} teachers. Updated ${updatedCerts} certificates in ${updatedTeachers} teachers.`);
    return NextResponse.json({ message: "Certificates updated", updatedTeachers, updatedCerts, teachersChecked: teachers.length, certsChecked: checkedCerts });
  } catch (error) {
    console.error("Error updating certificates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 