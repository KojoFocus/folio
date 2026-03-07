import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Plan } from "@/lib/claude";

export const authOptions: NextAuthOptions = {
  // No database adapter — sessions are JWT cookies (no DB needed for auth)
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        // Use Google's stable sub as the user ID
        token.id   = (profile as { sub?: string })?.sub ?? token.sub ?? user.id;
        token.plan = (user as { plan?: Plan }).plan ?? "free";
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id   as string;
        session.user.plan = token.plan as Plan;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
