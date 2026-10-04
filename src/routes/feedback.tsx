import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { AudioPlayer, Recorder, Shell } from "@/components/rooted";
import { FEEDBACK_TAGS, submitFeedback } from "@/lib/store";

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

const PROMPTS = ["What did you enjoy most?", "What surprised you?", "What would you change?", "What would you tell another traveler?"];

function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [audio, setAudio] = useState<string>();
  const [tags, setTags] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  return (
    <Shell title="Feedback" back="/">
      {done ? (
        <div className="px-5 py-12 text-center">
          <h2 className="text-3xl font-semibold">Thank you</h2>
          <p className="mt-2 text-lg">Your feedback has been shared with Noor.</p>
          <p className="mt-1 text-sm text-muted-foreground">It helps her shape future visits.</p>
          <button onClick={() => { setDone(false); setRating(0); setText(""); setAudio(undefined); setTags([]); }} className="mt-6 font-semibold text-primary">Leave another</button>
        </div>
      ) : (
        <form
          className="space-y-6 px-5 py-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rating) return;
            submitFeedback({ rating, tags, ...(text ? { text } : {}), ...(audio ? { audio } : {}) });
            setDone(true);
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
          <button disabled={!rating} className="w-full rounded-full bg-primary py-4 text-lg font-semibold text-primary-foreground shadow-warm disabled:opacity-40">Send feedback</button>
        </form>
      )}

    </Shell>
  );
}
