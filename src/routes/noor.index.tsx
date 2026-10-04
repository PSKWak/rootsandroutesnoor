import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Smartphone } from "lucide-react";
import noor from "@/assets/noor.jpg";
import { ListenButton, Shell } from "@/components/rooted";
import { NOOR_LANGUAGES, feedbackThemes, lockHost, resetDemo, setNoorLanguage, useStore } from "@/lib/store";

export const Route = createFileRoute("/noor/")({ component: Dashboard });

function Dashboard() {
  const s = useStore((x) => x);
  const [confirm, setConfirm] = useState(false);
  const newEnq = s.messages.filter((m) => m.from === "visitor" && !m.heardByNoor && m.status === "delivered").length;
  const pending = s.bookings.filter((b) => b.status === "awaiting" || b.status === "requested").length;
  const upcoming = s.bookings.filter((b) => b.status === "confirmed").length;
  const liked = s.feedback.length ? Math.round((s.feedback.filter((f) => f.rating >= 4).length / s.feedback.length) * 100) : null;
  const top = feedbackThemes(s.feedback)[0];
  const tiles = [
    { to: "/noor/inbox", emoji: "💬", label: "New messages", value: String(newEnq), say: `${newEnq} new messages` },
    { to: "/noor/bookings", emoji: "📅", label: "Requests waiting", value: String(pending), say: `${pending} visit requests waiting for you` },
    { to: "/noor/bookings", emoji: "✅", label: "Upcoming visits", value: String(upcoming), say: `${upcoming} upcoming visits` },
    { to: "/noor/insights", emoji: "😊", label: "Visitors liked it", value: liked === null ? "–" : `${liked}%`, say: liked === null ? "No reviews yet" : `${liked} percent of visitors liked their visit` },
  ] as const;
  const demoFb = s.feedback.some((f) => f.id.length <= 3);

  return (
    <Shell>
      <div className="px-5 pt-8">
        <div className="flex items-center gap-3">
          <img src={noor} alt="" width={816} height={816} className="h-14 w-14 rounded-full object-cover" />
          <h1 className="text-3xl font-semibold">Hello Noor</h1>
        </div>

        <label className="mt-5 flex items-center justify-between gap-3 rounded-2xl border bg-card p-3 font-semibold">
          🗣️ My language
          <select value={s.noorLanguage} onChange={(e) => setNoorLanguage(e.target.value)} className="h-12 rounded-xl border bg-background px-3 text-base">
            {NOOR_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>

        {s.sms[0] && (
          <div className="mt-4 flex gap-3 rounded-2xl bg-foreground p-4 font-mono text-sm text-background">
            <Smartphone className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p><span className="block text-[11px] uppercase opacity-80">SMS fallback — prototype</span>{s.sms[0].text}</p>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <div key={t.label} className="flex flex-col gap-2 rounded-3xl border bg-card p-4 shadow-warm">
              <Link to={t.to} className="flex flex-col">
                <span className="text-3xl" aria-hidden="true">{t.emoji}</span>
                <span className="mt-1 text-4xl font-bold">{t.value}</span>
                <span className="text-sm font-semibold">{t.label}</span>
              </Link>
              <ListenButton text={t.say} language={s.noorLanguage} />
            </div>
          ))}
        </div>

        {top && (
          <Link to="/noor/insights" className="mt-3 flex items-center gap-4 rounded-3xl bg-accent p-5 text-accent-foreground">
            <span className="text-4xl" aria-hidden="true">⭐</span>
            <span><span className="block text-sm font-semibold">Most mentioned</span><span className="text-xl font-semibold">{top.count} visitors {top.label}</span></span>
          </Link>
        )}
        {demoFb && <p className="mt-2 text-xs text-muted-foreground">Includes sample feedback (demo).</p>}

        <div className="mt-8 flex flex-wrap justify-between gap-3 text-sm">
          <button onClick={() => lockHost()} className="font-semibold text-muted-foreground underline">Log out</button>
          <button onClick={() => setConfirm(true)} className="font-semibold text-muted-foreground underline">Reset demo</button>
        </div>
      </div>

      {confirm && (
        <div role="dialog" aria-modal="true" aria-labelledby="reset-t" className="fixed inset-0 z-30 flex items-end justify-center bg-foreground/50 p-4">
          <div className="w-full max-w-md space-y-3 rounded-3xl bg-card p-6">
            <h2 id="reset-t" className="text-2xl font-semibold">Reset the demo?</h2>
            <p>This will remove the current demo conversation, feedback, and booking state.</p>
            <div className="grid grid-cols-2 gap-2">
              <button autoFocus onClick={() => setConfirm(false)} className="rounded-full border py-4 font-semibold">Cancel</button>
              <button onClick={() => { resetDemo(); setConfirm(false); }} className="rounded-full bg-destructive py-4 font-semibold text-destructive-foreground">Reset Demo</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
