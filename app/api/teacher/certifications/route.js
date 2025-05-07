import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherModel } from "@/models/Teacher";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST /api/teacher/certifications - Add a new certification
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      issuingOrganization,
      issueDate,
      credentialId,
      credentialUrl,
      imageUrl,
      type,
    } = body;

    if (!name || !issuingOrganization || !issueDate || !imageUrl || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Calculate points based on certification type
    const points =
      {
        fdp: 5,
        global: 10,
        webinar: 3,
        online: 8,
        other: 2,
      }[type] || 2;

    const teacher = await db
      .collection("teachers")
      .findOne({ email: session.user.email });

    if (!teacher) {
      return new NextResponse("Teacher not found", { status: 404 });
    }

    const newCertification = {
      _id: new ObjectId(),
      name,
      issuingOrganization,
      issueDate,
      credentialId,
      credentialUrl,
      imageUrl,
      type,
      points,
    };

    const result = await db.collection("teachers").updateOne(
      { email: session.user.email },
      {
        $push: { certifications: newCertification },
        $inc: { totalPoints: points },
      }
    );

    if (result.modifiedCount === 0) {
      return new NextResponse("Failed to add certification", { status: 500 });
    }

    // Fetch and save with Mongoose to recalculate totalPoints
    const TeacherModel = await getTeacherModel();
    const teacherDoc = await TeacherModel.findOne({ email: session.user.email });
    if (teacherDoc) {
      await teacherDoc.save();
    }

    const updatedTeacher = await db
      .collection("teachers")
      .findOne({ email: session.user.email });
    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error("Error adding certification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET /api/teacher/certifications - Get all certifications for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const TeacherModel = await getTeacherModel();
    const teacher = await TeacherModel.findOne({ userId: session.user.id });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher.certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
