import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// For now, we'll return static data. In a real application, this would come from a database.
const upcomingCertifications = [
  {
    name: "Advanced Teaching Methods",
    date: "June 15, 2025",
    department: "All Departments",
  },
  {
    name: "Research Grant Writing",
    date: "July 2, 2025",
    department: "Research Faculty",
  },
  {
    name: "Digital Learning Technologies",
    date: "July 18, 2025",
    department: "All Departments",
  },
  {
    name: "Academic Leadership",
    date: "August 5, 2025",
    department: "Department Chairs",
  },
  {
    name: "Artificial Intelligence in Education",
    date: "August 21, 2025",
    department: "Computer Science",
  },
  {
    name: "Inclusive Teaching Practices",
    date: "September 10, 2025",
    department: "All Departments",
  },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(upcomingCertifications);
  } catch (error) {
    console.error("Error fetching upcoming certifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
