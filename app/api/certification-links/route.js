import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCertificationLinkModel } from "@/models/CertificationLink";

// Admin emails for validation
const ADMIN_EMAILS = [
  "siddhartht4206@gmail.com",
  "23r21a12b3@mlrit.ac.in",
  "23r21a1285@mlrit.ac.in",
];

// GET: Fetch all certification links
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const CertificationLinkModel = await getCertificationLinkModel();

    // Fetch upcoming certification links (where lastDateToApply is in the future)
    const certificationLinks = await CertificationLinkModel.find({
      lastDateToApply: { $gte: new Date() },
    }).sort({ lastDateToApply: 1 });

    return NextResponse.json(certificationLinks);
  } catch (error) {
    console.error("Error fetching certification links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new certification link (admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication and admin status
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.url || !data.description || !data.lastDateToApply) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const CertificationLinkModel = await getCertificationLinkModel();

    // Create new certification link
    const newCertificationLink = new CertificationLinkModel({
      url: data.url,
      description: data.description,
      lastDateToApply: new Date(data.lastDateToApply),
      department: data.department || "All Departments",
    });

    await newCertificationLink.save();

    return NextResponse.json(newCertificationLink, { status: 201 });
  } catch (error) {
    console.error("Error creating certification link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
