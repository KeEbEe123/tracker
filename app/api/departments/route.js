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

    // Fetch all teachers
    const teachers = await TeacherModel.find({});

    // Group teachers by department
    const departmentMap = {};

    teachers.forEach((teacher) => {
      if (!departmentMap[teacher.department]) {
        departmentMap[teacher.department] = {
          name: teacher.department,
          teachers: [],
          totalCerts: 0,
          totalScore: 0,
        };
      }

      departmentMap[teacher.department].teachers.push(teacher);
      departmentMap[teacher.department].totalCerts +=
        teacher.certifications.length;
      departmentMap[teacher.department].totalScore += teacher.totalPoints;
    });

    // Calculate averages and format the response
    const departments = Object.values(departmentMap).map((dept) => {
      return {
        name: dept.name,
        avgScore: Math.round(dept.totalScore / dept.teachers.length),
        totalCerts: dept.totalCerts,
        teacherCount: dept.teachers.length,
      };
    });

    // Sort by average score descending
    departments.sort((a, b) => b.avgScore - a.avgScore);

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching department data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
