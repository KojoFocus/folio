import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url      = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") ?? "pitch-deck.pptx";

  if (!url) return new Response("Missing url", { status: 400 });

  // Restrict to Cloudinary URLs only — prevents open proxy abuse
  if (!url.startsWith("https://res.cloudinary.com/")) {
    return new Response("Invalid url", { status: 400 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) return new Response("Upstream error", { status: 502 });

  return new Response(upstream.body, {
    headers: {
      "Content-Type":        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
