import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/conversations — list current user's conversations (most recent first)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await db.conversation.findMany({
    where:   { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take:    50,
    select:  { id: true, mode: true, title: true, updatedAt: true },
  });

  return Response.json(conversations);
}

// POST /api/conversations — create or update a conversation
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, mode, title, messages } = await req.json();

  if (!mode || !messages) return Response.json({ error: "Missing fields" }, { status: 400 });

  const data = {
    userId:   session.user.id,
    mode,
    title:    title ?? null,
    messages: JSON.stringify(messages),
  };

  const conversation = id
    ? await db.conversation.upsert({
        where:  { id },
        update: { title: data.title, messages: data.messages },
        create: { id, ...data },
      })
    : await db.conversation.create({ data });

  return Response.json({ id: conversation.id });
}
