import { NextResponse } from "next/server";
import { getTeacherModel } from "@/models/Teacher";

export async function POST() {
  try {
    const Teacher = await getTeacherModel();

    const result = await Teacher.updateMany(
      {
        $or: [
          { improvementRate: { $exists: false } },
          { recentAchievement: { $exists: false } },
        ],
      },
      {
        $set: {
          improvementRate: 0,
          recentAchievement: "",
        },
      }
    );

    return NextResponse.json({
      message: "Migration successful",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
