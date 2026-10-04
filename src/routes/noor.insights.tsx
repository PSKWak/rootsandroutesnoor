import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, Loader2, Sprout, Star } from "lucide-react";
import { AudioPlayer, Shell } from "@/components/rooted";
import { SMALL_SAMPLE, feedbackThemes, setInsightAction, useStore, type ActionChoice } from "@/lib/store";
import { summarizeFeedback, type InsightCard } from "@/lib/insights.functions";

export const Route = createFileRoute("/noor/insights")({
  head: () => ({
    meta: [
      { title: "Visitor Insights — Roots & Routes" },
      { name: "description", content: "Simple actions Noor can take, based on what visitors say." },
      { property: "og:title", content: "Visitor Insights — Roots & Routes" },
      { property: "og:description", content: "Simple actions Noor can take, based on what visitors say." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Insights,
});

const KIND: Record<InsightCard["kind"], { emoji: string; label: string; cls: string }> = {
  love: { emoji: "❤️", label: "What people love", cls: "bg-card" },
  wish: { emoji: "💡", label: "What people wish were different", cls: "bg-card" },
  recurring: { emoji: "🔁", label: "What keeps coming up", cls: "bg-card" },
  next: { emoji: "🚀", label: "What you could try next", cls: "bg-accent text-accent-foreground" },
};

const CHOICES: { v: ActionChoice; label: string; icon: typeof Check }[] = [
  { v: "trying", label: "I'll try", icon: Sprout },
  { v: "done", label: "Done", icon: Check },
  { v: "later", label: "Later", icon: Clock },
];

function ActionBox({ action }: { action: string }) {
  const choice = useStore((s) => s.insightActions?.[action]);
  return (
    <div className="space-y-3 rounded-2xl bg-background/70 p-4 text-foreground">
      <p className="text-xs font-semibold uppercase text-muted-foreground">Your next step</p>
      <p className={`text-lg font-semibold ${choice === "done" ? "line-through opacity-60" : ""}`}>{action}</p>
      <div className="grid grid-cols-3 gap-2">
        {CHOICES.map((c) => {
          const on = choice === c.v;
          return (
            <button
              key={c.v}
              onClick={() => setInsightAction(action, on ? null : c.v)}
              aria-pressed={on}
              className={`flex min-h-12 items-center justify-center gap-1 rounded-xl border text-sm font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >
              <c.icon className="h-4 w-4" /> {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Insights() {
  const fb = useStore((s) => s.feedback);
  const chosen = useStore((s) => s.insightActions ?? {});
  const demoCount = fb.filter((f) => f.id.length <= 3).length; // seed items: f1–f5
  const withText = fb.filter((f) => f.text);
  const q = useQuery({
    queryKey: ["insights", withText.map((f) => f.id).join(",")],
    queryFn: () => summarizeFeedback({ data: { feedback: withText.map((f) => ({ rating: f.rating, text: f.text ?? "", tags: f.tags })) } }),
    staleTime: Infinity,
  });
  const avg = fb.length ? (fb.reduce((a, f) => a + f.rating, 0) / fb.length).toFixed(1) : "–";
  const themes = feedbackThemes(fb);
  const trying = Object.entries(chosen).filter(([, v]) => v === "trying").map(([k]) => k);

  return (
    <Shell title="Visitor Insights" back="/noor">
      <div className="space-y-4 px-5 py-6">
        <p className="text-lg font-semibold">What visitors say — and what you can do</p>
        <div className="rounded-3xl bg-muted p-5">
          <p className="text-4xl font-bold">{avg} <Star className="inline h-7 w-7 fill-accent text-primary" /></p>
          <p className="text-sm">from {fb.length} visitors{demoCount ? ` · ${demoCount} are sample visitor feedback (demo)` : ""}</p>
        </div>

        {trying.length > 0 && (
          <div className="space-y-2 rounded-3xl border-2 border-primary bg-card p-5">
            <p className="font-semibold">🌱 You are trying</p>
            <ul className="space-y-2">
              {trying.map((a) => (
                <li key={a} className="flex items-center gap-3">
                  <span className="flex-1">{a}</span>
                  <button onClick={() => setInsightAction(a, "done")} className="flex min-h-11 items-center gap-1 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground">
                    <Check className="h-4 w-4" /> Done
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground">AI suggestions based only on the feedback below. You decide what to do.</p>

        {q.isLoading && <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Reading feedback…</p>}

        {q.data?.ok
          ? q.data.cards.map((c) => (
              <div key={c.kind} className={`space-y-2 rounded-3xl border p-5 shadow-warm ${KIND[c.kind].cls}`}>
                <p className="text-sm font-semibold">{KIND[c.kind].emoji} {KIND[c.kind].label}</p>
                <p className="text-xl font-semibold">{c.title}</p>
                <p>{c.explanation}</p>
                <p className="text-sm font-semibold">Mentioned by {c.mentions} of {withText.length} visitors</p>
                {c.example && <p className="text-sm italic opacity-80">"{c.example}"</p>}
                {c.action && <ActionBox action={c.action} />}
              </div>
            ))
          : !q.isLoading && (
              <ul className="space-y-3">
                {themes.map((t) => (
                  <li key={t.label} className="space-y-3 rounded-3xl border bg-card p-5">
                    <p className="text-lg"><span className="text-3xl font-bold text-primary">{t.count}</span> visitors {t.label}</p>
                    <ActionBox action={t.action} />
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
