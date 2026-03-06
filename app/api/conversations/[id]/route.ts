import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const conv = await db.conversation.findUnique({ where: { id, userId: session.user.id } });
  if (!conv) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ ...conv, messages: JSON.parse(conv.messages) });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.conversation.deleteMany({ where: { id, userId: session.user.id } });
  return Response.json({ ok: true });
}
