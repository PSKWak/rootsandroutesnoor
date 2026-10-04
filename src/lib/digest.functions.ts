import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Result = z.object({
  sentiment: z.enum(["positive", "mixed", "negative"]),
  findings: z.array(z.string()).max(5),
  suggestions: z.array(z.string()).max(3),
  sms: z.string().max(480),
  confidence: z.number().min(0).max(1),
});
export type Digest = z.infer<typeof Result>;

/** Summarises ONLY the given feedback and writes a short Swahili SMS for a basic phone. No names or contacts. */
export const buildDigest = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ feedback: z.array(z.object({ rating: z.number(), text: z.string().max(2000) })).min(1).max(100), language: z.string().min(2).max(40) }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "AI unavailable" };
    const list = data.feedback.map((f, i) => `${i + 1}. [${f.rating}★] ${f.text}`).join("\n");
    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions:
          `Reply with only a JSON object, no markdown. You help Noor, a coffee farmer, understand visitor feedback. Use ONLY the feedback given; never invent. Return {"sentiment":"positive|mixed|negative","findings":[what visitors actually said, short English, max 5],"suggestions":[AI ideas, short English, max 3],"sms":"...","confidence":0-1}. "sms" is written in natural, simple, conversational ${data.language} for a basic phone: max 300 characters, plain words, no AI or technical terms, no visitor names or contacts, keep numbers exact, keep names and place names unchanged. Start with how many visitors wrote. "confidence" is how sure you are the sms translation keeps the meaning.`,
        input: `Feedback (return json):\n${list}`,
      }),
    });
    if (!r.ok) {
      const body = await r.text();
      console.error("digest failed", r.status, body);
      return { ok: false as const, error: `AI failed (${r.status})` };
    }
    const j = (await r.json()) as { output_text?: string; output?: { content?: { text?: string }[] }[] };
    const txt = j.output_text ?? j.output?.flatMap((o) => o.content ?? []).map((c) => c.text ?? "").join("") ?? "";
    try {
      return { ok: true as const, digest: Result.parse(JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1))) };
    } catch (e) {
      console.error("digest parse", e, txt);
      return { ok: false as const, error: "Could not read AI summary" };
    }
  });
