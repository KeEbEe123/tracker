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
      return NextResponse.json({ message: "Ranks updated", count: teachers.length });
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
