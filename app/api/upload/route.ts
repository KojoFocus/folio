import { NextRequest } from "next/server";
import { parsePptx, parsePdf } from "@/lib/file-parser";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const PDF  = "application/pdf";

const ALLOWED = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  PDF,
  PPTX,
]);

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return Response.json(
      { error: "Unsupported file type. Please upload an image, PDF, or PPTX." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `File is too large (max 10 MB). "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB.` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extractedText = "";

  if (file.type === PPTX) {
    extractedText = await parsePptx(buffer);
  } else if (file.type === PDF) {
    extractedText = await parsePdf(buffer);
    // PDFs are sent to Claude as base64 (native support), so empty text is fine —
    // only report a problem if the file appears to be a completely empty document.
  }

  // For PPTX with no extractable text (image-only slides, scanned content, etc.)
  if (file.type === PPTX && !extractedText) {
    return Response.json({
      name:          file.name,
      type:          file.type,
      extractedText: "",
      message:
        "We could not extract text from this file — it may be a scanned PDF or image-only presentation. " +
        "Please describe your deck in the chat instead.",
    });
  }

  // For PDFs: Claude reads them natively, so even if parsePdf returns ""
  // (which it always does right now) we still let the client attach the file as base64.
  // Return a null message to signal success.
  return Response.json({
    name:          file.name,
    type:          file.type,
    extractedText: extractedText || null,
    message:       null,
  });
}
