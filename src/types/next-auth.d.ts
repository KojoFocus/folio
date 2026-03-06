import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { Plan } from "@/lib/claude";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: Plan;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    plan: Plan;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    plan: Plan;
  }
}
