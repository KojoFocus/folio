import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import type { Plan } from "@/lib/claude";

const PLAN_LIMITS: Record<Plan, number> = {
  free:       10,
  starter:    100,
  pro:        500,
  enterprise: Infinity,
};

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const plan       = (session.user.plan ?? "free") as Plan;
  const usageLimit = PLAN_LIMITS[plan];

  return (
    <div className="flex h-screen bg-field-950">
      <Sidebar
        plan={plan}
        usageCount={0}    // TODO: replace with real DB query
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
