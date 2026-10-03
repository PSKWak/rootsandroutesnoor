import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AudioPlayer, Shell } from "@/components/rooted";
import { SMALL_SAMPLE, feedbackThemes, useStore } from "@/lib/store";

export const Route = createFileRoute("/noor/insights")({ component: Insights });

function Insights() {
  const fb = useStore((s) => s.feedback);
  const themes = feedbackThemes(fb);
  const avg = fb.length ? (fb.reduce((a, f) => a + f.rating, 0) / fb.length).toFixed(1) : "–";
  return (
    <Shell title="Visitor insights" back="/noor">
      <div className="space-y-5 px-5 py-6">
        <div className="rounded-3xl bg-accent p-6 text-accent-foreground">
          <p className="text-5xl font-bold">{avg} <Star className="inline h-8 w-8 fill-current" /></p>
          <p className="mt-1">from {fb.length} visitors</p>
        </div>
        <ul className="space-y-3">
          {themes.map((t) => (
            <li key={t.label} className="flex items-center gap-4 rounded-2xl border bg-card p-4 text-lg">
              <span className="text-3xl font-bold text-primary">{t.count}</span>
              <span>visitors {t.label}</span>
            </li>
          ))}
        </ul>
        {fb.length < SMALL_SAMPLE && (
          <p className="rounded-2xl bg-muted p-4 text-sm">Only {fb.length} reviews so far. Treat these as early signs, not certain trends.</p>
        )}
        <h2 className="pt-2 text-xl font-semibold">What they said</h2>
        {fb.map((f) => (
          <div key={f.id} className="space-y-2 rounded-2xl border bg-card p-4">
            <p className="text-primary">{"★".repeat(f.rating)}</p>
            {f.text && <p>{f.text}</p>}
            {f.audio && <AudioPlayer src={f.audio} label="Listen" />}
          </div>
        ))}
      </div>
    </Shell>
  );
}
