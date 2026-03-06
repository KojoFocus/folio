import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
import type { Plan } from "@/lib/claude";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),

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
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
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
