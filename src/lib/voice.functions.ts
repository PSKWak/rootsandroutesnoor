import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  audio: z.string().max(15_000_000).optional(), // data URL
  text: z.string().max(4000).optional(),
  from: z.enum(["visitor", "noor"]),
  targetLanguage: z.string().min(2).max(40),
});

/** Transcribes audio with ElevenLabs (server-side key) and translates with Lovable AI. */
export const processVoice = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    let transcript = data.text ?? "";
    if (data.audio) {
      const key = process.env["ELEVENLABS_API_KEY"];
      if (!key) return { ok: false as const, error: "Voice service is not connected." };
      const m = /^data:([^;]+);base64,(.*)$/.exec(data.audio);
      if (!m) return { ok: false as const, error: "Invalid recording." };
      const bytes = Buffer.from(m[2]!, "base64");
      const fd = new FormData();
      fd.append("file", new Blob([bytes], { type: m[1]! }), "voice.webm");
      fd.append("model_id", "scribe_v2");
      const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: { "xi-api-key": key },
        body: fd,
      });
      if (!r.ok) {
        console.error("STT failed", r.status, await r.text());
        return { ok: false as const, error: `Transcription failed (${r.status}).` };
      }
      transcript = ((await r.json()) as { text?: string }).text?.trim() ?? "";
    }
    if (!transcript) return { ok: true as const, transcript: "", translated: "" };

    const aiKey = process.env["LOVABLE_API_KEY"];
    if (!aiKey) return { ok: true as const, transcript, translated: "", error: "Translation unavailable." };
    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: `Translate the user's message into ${data.targetLanguage}. Keep it warm and simple. Output only the translation.`,
        input: transcript,
      }),
    });
    if (!r.ok) {
      console.error("Translate failed", r.status, await r.text());
      return { ok: true as const, transcript, translated: "", error: `Translation failed (${r.status}).` };
    }
    const j = (await r.json()) as { output_text?: string; output?: { content?: { text?: string }[] }[] };
    const translated = j.output_text ?? j.output?.flatMap((o) => o.content ?? []).map((c) => c.text ?? "").join("") ?? "";
    return { ok: true as const, transcript, translated: translated.trim() };
  });
