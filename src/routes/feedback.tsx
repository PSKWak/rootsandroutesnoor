import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { AudioPlayer, Recorder, Shell } from "@/components/rooted";
import { FEEDBACK_TAGS, retryFeedback, submitFeedback, useStore } from "@/lib/store";
import { SYNC_LABEL } from "@/lib/feedback-sync";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Roots & Routes — Feedback" },
      { name: "description", content: "Share text or voice feedback about your visit to Noor's farm." },
      { property: "og:title", content: "Feedback — Roots & Routes" },
      { property: "og:description", content: "Tell Noor how your experience went." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FeedbackPage,
});

const PROMPTS = ["What did you enjoy most?", "What surprised you?", "What could be better?", "Would you recommend this experience?"];

function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [audio, setAudio] = useState<string>();
  const [photo, setPhoto] = useState<string>();
  const [tags, setTags] = useState<string[]>([]);
  const [done, setDone] = useState<string | false>(false);
  const [consent, setConsent] = useState(true);
  const sent = useStore((s) => (done ? s.feedback.find((f) => f.id === done) : undefined));

  return (
    <Shell title="Feedback" back="/">
      {done ? (
        <div className="px-5 py-12 text-center">
          <h2 className="text-3xl font-semibold">Thank you</h2>
          <p className="mt-2 text-lg">Your feedback has been shared with Noor.</p>
          {sent?.sync && (
            <p role="status" aria-live="polite" className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 font-semibold">
              {sent.sync === "synced" ? "✅" : sent.sync === "failed" ? "⚠️" : sent.sync === "waiting" ? "🔄" : "📱"} {SYNC_LABEL[sent.sync]}
            </p>
          )}
          {sent?.sync === "failed" && <button onClick={() => retryFeedback(sent.id)} className="mt-3 block w-full rounded-full border py-3 font-semibold">↻ Try again</button>}
          <p className="mt-1 text-sm text-muted-foreground">Your feedback helps Noor improve future experiences. If you're offline, it's saved on this phone.</p>
          <button onClick={() => { setDone(false); setRating(0); setText(""); setAudio(undefined); setPhoto(undefined); setTags([]); }} className="mt-6 font-semibold text-primary">Leave another</button>
        </div>
      ) : (
        <form
          className="space-y-6 px-5 py-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rating) return;
            setDone(submitFeedback({ rating, tags, consent, ...(text ? { text } : {}), ...(audio ? { audio } : {}), ...(photo ? { photo } : {}) }));
          }}
        >
          <h2 className="text-3xl font-semibold">How was your experience?</h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`} className="p-1">
                <Star className={`h-10 w-10 ${n <= rating ? "fill-accent text-primary" : "text-border"}`} />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <button key={p} type="button" onClick={() => setText((t) => (t ? t + "\n" : "") + p + " ")} className="rounded-full bg-muted px-3 py-2 text-sm">{p}</button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Write or speak in any language — it will be translated for Noor.</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="What stayed with you?" className="w-full rounded-2xl border bg-card p-4" />
          <div className="space-y-2">
            {audio ? <AudioPlayer src={audio} label="Your voice feedback" /> : <Recorder big label="Or record voice feedback" onDone={(a) => setAudio(a)} />}
          </div>
          <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-dashed bg-card font-semibold">
            📷 {photo ? "Change photo" : "Add a photo (optional)"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const img = new Image();
              img.onload = () => {
                const c = document.createElement("canvas");
                const k = Math.min(1, 800 / Math.max(img.width, img.height));
                c.width = img.width * k; c.height = img.height * k;
                c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
                setPhoto(c.toDataURL("image/jpeg", 0.7));
                URL.revokeObjectURL(img.src);
              };
              img.src = URL.createObjectURL(f);
            }} />
          </label>
          {photo && <img src={photo} alt="Your photo from the visit" className="max-h-48 w-full rounded-2xl object-cover" />}
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map((t) => {
              const on = tags.includes(t);
              return (
                <button key={t} type="button" onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}
                  className={`rounded-full border px-4 py-2 text-sm ${on ? "border-secondary bg-secondary text-secondary-foreground" : "bg-card"}`}>
                  {t}
                </button>
              );
            })}
          </div>
          <label className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5" />
            <span>Let Noor's helper (AI) read this to help her. It's kept on this phone until there's signal. Your name is never sent to Noor by text.</span>
          </label>
          <button disabled={!rating} className="w-full rounded-full bg-primary py-4 text-lg font-semibold text-primary-foreground shadow-warm disabled:opacity-40">Send feedback</button>
        </form>
      )}

    </Shell>
  );
}
