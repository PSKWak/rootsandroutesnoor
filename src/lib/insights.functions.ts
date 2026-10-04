import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Card = z.object({
  kind: z.enum(["love", "wish", "recurring", "next"]),
  title: z.string(),
  explanation: z.string(),
  mentions: z.number().int().min(0),
  example: z.string().optional(),
  action: z.string().optional(),
});
export type InsightCard = z.infer<typeof Card>;

/** Summarises ONLY the feedback passed in. Never invents data. */
export const summarizeFeedback = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ feedback: z.array(z.object({ rating: z.number(), text: z.string().max(2000), tags: z.array(z.string()) })).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "AI unavailable" };
    const list = data.feedback.map((f, i) => `${i + 1}. [${f.rating}★] [${f.tags.join(", ")}] ${f.text}`).join("\n");
    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions:
          "Reply with only a JSON object, no markdown. You help a coffee farmer (Noor) understand visitor feedback. Use ONLY the feedback given. Write very simple words. Return JSON: {\"cards\":[...]} with exactly 4 cards, kinds love, wish, recurring, next (one each). Each: title (max 6 words), explanation (one short sentence), mentions (exact count of feedback items supporting it), example (short quote copied from feedback, optional), action (ONE small, concrete thing Noor can do soon, max 10 words, starts with a verb, no cost or tech needed, e.g. 'Show guests how you roast coffee'). For 'next', give a gentle suggestion. Never exaggerate; if evidence is thin say so.",
        input: `Visitor feedback (return json):\n${list || "(no feedback)"}`,
      }),
    });
    if (!r.ok) {
      console.error("insights failed", r.status, await r.text());
      return { ok: false as const, error: `AI failed (${r.status})` };
    }
    const j = (await r.json()) as { output_text?: string; output?: { content?: { text?: string }[] }[] };
    const txt = j.output_text ?? j.output?.flatMap((o) => o.content ?? []).map((c) => c.text ?? "").join("") ?? "";
    try {
      const parsed = z.object({ cards: z.array(Card) }).parse(JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)));
      return { ok: true as const, cards: parsed.cards };
    } catch (e) {
      console.error("insights parse", e, txt);
      return { ok: false as const, error: "Could not read AI summary" };
    }
  });
