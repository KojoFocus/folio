import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { content } = await req.json();

  if (!content?.trim()) {
    return Response.json({ error: "No content provided" }, { status: 400 });
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: `You are an expert pitch deck reviewer with experience at top-tier VC firms.
Analyze the provided pitch deck content and return ONLY valid JSON with this exact structure:
{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence honest overview of the deck's investor-readiness>",
  "sections": [
    {
      "name": "<section name>",
      "score": <integer 0-100>,
      "feedback": "<specific, honest feedback>",
      "suggestions": ["<actionable suggestion>", ...]
    }
  ],
  "topStrengths": ["<strength>", ...],
  "criticalIssues": ["<issue>", ...]
}

Evaluate these sections if present: Problem, Solution, Market Size, Business Model, Traction, Team, Ask/Use of Funds.
Be specific, honest, and actionable. Focus on what sophisticated investors care about.
Return ONLY the JSON object — no markdown, no explanation.`,
      },
      { role: "user", content: `Please review this pitch deck:\n\n${content}` },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";

  try {
    return Response.json(JSON.parse(text));
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return Response.json(JSON.parse(match[0])); } catch { /* fall through */ }
    }
    return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}
