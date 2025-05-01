import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getTeacherModel } from "@/models/Teacher";

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
      try {
        // Only handle successful sign-ins
        if (account.provider === "google") {
          const TeacherModel = await getTeacherModel();

          // Check if teacher already exists
          const existingTeacher = await TeacherModel.findOne({
            userId: user.id,
          });

          // If teacher doesn't exist yet, that's fine - we'll redirect to onboarding
          // but we want to allow sign in either way
          return true;
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // Still allow sign in even if our DB check fails
      }
    },
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
