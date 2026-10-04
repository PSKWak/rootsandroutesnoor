import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { AudioPlayer, Shell } from "@/components/rooted";
import { SMALL_SAMPLE, feedbackThemes, useStore } from "@/lib/store";
import { summarizeFeedback, type InsightCard } from "@/lib/insights.functions";

export const Route = createFileRoute("/noor/insights")({ component: Insights });

const KIND: Record<InsightCard["kind"], { emoji: string; label: string; cls: string }> = {
  love: { emoji: "❤️", label: "What people love", cls: "bg-card" },
  wish: { emoji: "💡", label: "What people wish were different", cls: "bg-card" },
  recurring: { emoji: "🔁", label: "What keeps coming up", cls: "bg-card" },
  next: { emoji: "🚀", label: "What you could try next", cls: "bg-accent text-accent-foreground" },
};

function Insights() {
  const fb = useStore((s) => s.feedback);
  const demoCount = fb.filter((f) => f.id.length <= 3).length; // seed items: f1–f5
  const withText = fb.filter((f) => f.text);
  const q = useQuery({
    queryKey: ["insights", withText.map((f) => f.id).join(",")],
    queryFn: () => summarizeFeedback({ data: { feedback: withText.map((f) => ({ rating: f.rating, text: f.text ?? "", tags: f.tags })) } }),
    staleTime: Infinity,
  });
  const avg = fb.length ? (fb.reduce((a, f) => a + f.rating, 0) / fb.length).toFixed(1) : "–";
  const themes = feedbackThemes(fb);

  return (
    <Shell title="Visitor Insights" back="/noor">
      <div className="space-y-4 px-5 py-6">
        <p className="text-lg font-semibold">What are visitors actually saying?</p>
        <div className="rounded-3xl bg-muted p-5">
          <p className="text-4xl font-bold">{avg} <Star className="inline h-7 w-7 fill-accent text-primary" /></p>
          <p className="text-sm">from {fb.length} visitors{demoCount ? ` · ${demoCount} are sample visitor feedback (demo)` : ""}</p>
        </div>
        <p className="text-xs text-muted-foreground">AI-generated summaries of visitor feedback. Based only on the feedback below.</p>

        {q.isLoading && <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Reading feedback…</p>}

        {q.data?.ok
          ? q.data.cards.map((c) => (
              <div key={c.kind} className={`space-y-2 rounded-3xl border p-5 shadow-warm ${KIND[c.kind].cls}`}>
                <p className="text-sm font-semibold">{KIND[c.kind].emoji} {KIND[c.kind].label}</p>
                <p className="text-xl font-semibold">{c.title}</p>
                <p>{c.explanation}</p>
                <p className="text-sm font-semibold">Mentioned by {c.mentions} of {withText.length} visitors</p>
                {c.example && <p className="text-sm italic opacity-80">"{c.example}"</p>}
              </div>
            ))
          : !q.isLoading && (
              <ul className="space-y-3">
                {themes.map((t) => (
                  <li key={t.label} className="flex items-center gap-4 rounded-2xl border bg-card p-4 text-lg">
                    <span className="text-3xl font-bold text-primary">{t.count}</span>
                    <span>visitors {t.label}</span>
                  </li>
                ))}
              </ul>
            )}

        {fb.length < SMALL_SAMPLE && (
          <p className="rounded-2xl bg-muted p-4 text-sm">Only {fb.length} reviews so far. These are early signs, not certain trends.</p>
        )}

        <h2 className="pt-2 text-xl font-semibold">What they said</h2>
        {fb.map((f) => (
          <div key={f.id} className="space-y-2 rounded-2xl border bg-card p-4">
            <div className="flex justify-between">
              <p className="text-primary">{"★".repeat(f.rating)}</p>
              {f.id.length <= 3 && <span className="text-[10px] font-semibold uppercase text-muted-foreground">Sample (demo)</span>}
            </div>
            {f.text && <p>{f.text}</p>}
            {f.audio && <AudioPlayer src={f.audio} label="Listen" />}
          </div>
        ))}
      </div>
    </Shell>
  );
}
