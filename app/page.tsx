import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HomeClient } from "@/components/HomeClient";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return <HomeClient isSignedIn={!!session?.user} />;
}
