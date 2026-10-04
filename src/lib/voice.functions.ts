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
      const key = process.env["LOVABLE_API_KEY"];
      if (!key) return { ok: false as const, error: "Voice service is not connected." };
      const m = /^data:([^;]+);base64,(.*)$/.exec(data.audio);
      if (!m) return { ok: false as const, error: "Invalid recording." };
      const bytes = Buffer.from(m[2]!, "base64");
      const mime = m[1]!.replace(/^video\//, "audio/").split(";")[0]!;
      const fd = new FormData();
      fd.append("file", new Blob([bytes], { type: mime }), `voice.${mime.split("/")[1] ?? "webm"}`);
      fd.append("model", "google/gemini-3.5-transcribe");
      const r = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: fd,
      });
      if (!r.ok) {
        console.error("STT failed", r.status, await r.text());
        return { ok: false as const, error: r.status === 402 ? "AI credits used up." : `Transcription failed (${r.status}).` };
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

/** Reads text aloud with Lovable AI speech. Used only for translations/narration — never as Noor's voice. */
export const speakTranslation = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ text: z.string().min(1).max(1500) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "Voice service is not connected." };
    const r = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-tts-preview",
        contents: [{ role: "user", parts: [{ text: `Say warmly and slowly: ${data.text}` }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } },
        stream_format: "audio",
      }),
    });
    if (!r.ok) {
      console.error("TTS failed", r.status, await r.text());
      return { ok: false as const, error: `Read-aloud failed (${r.status}).` };
    }
    return { ok: true as const, audio: `data:audio/wav;base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}` };
  });

/** Translates short text (e.g. an insight) into Noor's chosen language. */
export const translateText = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ text: z.string().min(1).max(2000), targetLanguage: z.string().min(2).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const aiKey = process.env["LOVABLE_API_KEY"];
    if (!aiKey) return { ok: false as const, text: "" };
    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: `Translate into ${data.targetLanguage}. Very simple words. Output only the translation.`,
        input: data.text,
      }),
    });
    if (!r.ok) return { ok: false as const, text: "" };
    const j = (await r.json()) as { output_text?: string; output?: { content?: { text?: string }[] }[] };
    const t = j.output_text ?? j.output?.flatMap((o) => o.content ?? []).map((c) => c.text ?? "").join("") ?? "";
    return { ok: true as const, text: t.trim() };
  });
