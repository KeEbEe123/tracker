import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getBlockedLoginModel } from "@/models/BlockedLogin";
import { ADMIN_EMAILS } from "@/utils/adminEmails";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !ADMIN_EMAILS.includes(session.user?.email)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const BlockedLogin = await getBlockedLoginModel();
  const logins = await BlockedLogin.find().sort({ attemptedAt: -1 }).lean();
  return new Response(JSON.stringify(logins), { status: 200 });
} 