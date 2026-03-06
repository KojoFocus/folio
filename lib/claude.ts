// Groq models — free tier, no card required (https://console.groq.com)
export const MODEL        = "llama-3.1-8b-instant";               // fast, conversational
export const MODEL_PRO    = "llama-3.3-70b-versatile";            // best available on Groq
export const VISION_MODEL = "llama-3.2-90b-vision-preview";       // for messages with images

export type Plan = "free" | "starter" | "pro" | "enterprise";

export type ModelLabel = "Llama 8B" | "DeepSeek R1";

export function getModelForPlan(plan: Plan): string {
  return plan === "pro" || plan === "enterprise" ? MODEL_PRO : MODEL;
}

export function getModelLabel(model: string): ModelLabel {
  return model === MODEL_PRO ? "DeepSeek R1" : "Llama 8B";
}

/**
 * Stub — replace with a real DB query once the database is set up.
 *
 * Example with Prisma:
 *   const user = await db.user.findUnique({ where: { id: userId } });
 *   return (user?.plan ?? "free") as Plan;
 */
export async function getUserPlan(_userId: string): Promise<Plan> {
  return "free";
}
