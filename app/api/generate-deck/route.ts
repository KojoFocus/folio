import { NextRequest } from "next/server";
import { buildPptx, uploadToCloudinary, type DeckData } from "@/lib/deck-generator";

export async function POST(req: NextRequest) {
  const deck: DeckData = await req.json();

  if (!deck.title || !Array.isArray(deck.slides) || deck.slides.length === 0) {
    return Response.json({ error: "Invalid deck data." }, { status: 400 });
  }

  const buffer   = await buildPptx(deck);
  const safeName = deck.title.replace(/[^a-z0-9]/gi, "-").toLowerCase().replace(/-+/g, "-").replace(/^-|-$/g, "");
  const filename = `${safeName}-pitch-deck.pptx`;
  const url      = await uploadToCloudinary(buffer, filename);

  return Response.json({ url, filename, slideCount: deck.slides.length });
}
