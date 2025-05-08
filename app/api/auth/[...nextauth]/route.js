import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getTeacherModel } from "@/models/Teacher";
import { ADMIN_EMAILS } from "@/utils/adminEmails";
import { getBlockedLoginModel } from "@/models/BlockedLogin";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to the session from the token
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // Persist provider info to token
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      console.log("[NextAuth signIn] Callback triggered");
      try {
        if (account.provider === "google") {
          const TeacherModel = await getTeacherModel();
          const BlockedLoginModel = await getBlockedLoginModel();

          const email = user.email;
          const isAdmin = ADMIN_EMAILS.some(admin => admin.toLowerCase() === email.toLowerCase());
          const allowedDomains = ["mlrit.ac.in", "mlrinstitutions.ac.in"];
          const emailDomain = email.split("@").pop();
          const isAllowedDomain = allowedDomains.some((d) => emailDomain === d);
          const rollNumberPattern = /^[0-9]{2}[a-z0-9]{8}@mlrit\.ac\.in$/i;

          console.log("[NextAuth signIn] Email:", email);
          console.log("[NextAuth signIn] isAdmin:", isAdmin);
          console.log("[NextAuth signIn] isAllowedDomain:", isAllowedDomain);
          console.log("[NextAuth signIn] rollNumberPattern:", rollNumberPattern.test(email));

          // Block if not allowed domain and not admin
          if (!isAllowedDomain && !isAdmin) {
            console.log("[NextAuth signIn] Blocked: Not a college domain");
            await BlockedLoginModel.create({
              email,
              reason: "Not a college domain",
            });
            throw new Error("use_college_email");
          }

          // Block if roll number format (unless admin)
          if (rollNumberPattern.test(email) && !isAdmin) {
            console.log("[NextAuth signIn] Blocked: Student roll number format");
            await BlockedLoginModel.create({
              email,
              reason: "Student roll number format",
            });
            throw new Error("student_email_blocked");
          }

          // Check if teacher already exists
          const existingTeacher = await TeacherModel.findOne({
            userId: user.id,
          });
          console.log("[NextAuth signIn] Allowed: Proceeding with sign in");
          return true;
        }
        return true;
      } catch (error) {
        // If error is our custom error, redirect with error param
        if (error.message === "use_college_email") {
          return "/auth/signin?error=Use college email for login.";
        }
        if (error.message === "student_email_blocked") {
          return "/auth/signin?error=Student roll number emails are not allowed.";
        }
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
