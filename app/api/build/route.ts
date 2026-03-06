import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const data = await req.json();

  const prompt = `Create a compelling, investor-ready pitch deck for this startup:

Company: ${data.company}
Stage: ${data.stage}
Industry: ${data.industry}
Problem: ${data.problem}
Solution: ${data.solution}
Market: ${data.market}
Business model: ${data.businessModel || "Not specified"}
Traction: ${data.traction || "Pre-revenue"}
Team: ${data.team || "Not specified"}
Ask: ${data.ask || "Not specified"}

Return ONLY valid JSON with this exact structure:
{
  "slides": [
    {
      "number": <integer>,
      "title": "<slide title>",
      "content": "<main body content — narrative prose for this slide>",
      "speakerNotes": "<talking points the founder should say out loud>",
      "keyPoints": ["<bullet point>", ...]
    }
  ]
}

Generate 10-12 slides. Include: Cover, Problem, Solution, Market Size, Business Model, Traction, Competition, Team, Financials/Projections, Ask.
Make the narrative compelling, specific to the company's context, and sharply focused on what investors care about.
Return ONLY the JSON object — no markdown, no explanation.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
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
