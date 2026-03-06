import JSZip from "jszip";

/**
 * Extract readable text from a PPTX file.
 * PPTX files are ZIP archives; slide content lives in ppt/slides/slideN.xml.
 * Returns an empty string if the file has no selectable text (e.g. image-only).
 */
export async function parsePptx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);

  // Collect slide files in slide order
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const num = (s: string) => parseInt(s.match(/\d+/)?.[0] ?? "0", 10);
      return num(a) - num(b);
    });

  const slides: string[] = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async("text");

    // Pull text out of <a:t> tags (DrawingML text runs)
    const raw = xml
      .replace(/<a:t>([^<]*)<\/a:t>/g, "$1 ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (raw) {
      slides.push(`[Slide ${i + 1}]\n${raw}`);
    }
  }

  return slides.join("\n\n");
}

/**
 * PDFs are handled natively by Claude (sent as base64 document blocks),
 * so no server-side extraction is needed. This function exists as a hook
 * for future use (e.g. when a DB or full-text search index is introduced).
 */
export async function parsePdf(_buffer: Buffer): Promise<string> {
  return "";
}
