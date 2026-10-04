import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/rooted";
import { EXPERIENCES, requestPickup } from "@/lib/store";
import { ACTIVITIES, CALENDAR, LOCATION, TERRAIN, TRANSPORT, monthIndexFromDate, monthsFor } from "@/lib/farm-info";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Plan your visit — Roots & Routes" },
      { name: "description", content: "When to visit Noor's farm, what you can experience each month, and how to get there." },
      { property: "og:title", content: "Plan your visit — Roots & Routes" },
      { property: "og:description", content: "Seasonal farm calendar, getting here and know-before-you-go." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Visit,
});

const short = (m: string) => m.slice(0, 3);
function range(months: string[]) {
  if (months.length === 12) return "All year";
  return months.map(short).join(", ");
}

function Visit() {
  const [mi, setMi] = useState(3);
  const m = CALENDAR[mi]!;
  const a = ACTIVITIES[m.activity];

  return (
    <Shell title="Plan your visit" back="/experience">
      <p className="mx-5 mt-4 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
        Sample information — the seasons, location and terrain below will be updated once Noor confirms them.
      </p>

      <section className="px-5 py-6">
        <h2 className="text-2xl font-semibold">When should I visit?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose your month to see what's happening on the farm.</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {CALENDAR.map((c, i) => (
            <button
              key={c.month}
              onClick={() => setMi(i)}
              aria-pressed={i === mi}
              className={`rounded-xl py-2 text-sm font-semibold ${i === mi ? "bg-primary text-primary-foreground" : "bg-card border"}`}
            >
              <span className="block text-lg">{ACTIVITIES[c.activity].icon}</span>
              {short(c.month)}
            </button>
          ))}
        </div>
        <article className="mt-4 rounded-2xl border bg-card p-5" aria-live="polite">
          <p className="text-sm text-muted-foreground">{m.month}</p>
          <h3 className="mt-1 text-xl font-semibold">{a.icon} {a.label}</h3>
          <p className="mt-1">{a.desc}</p>
          <p className="mt-3 text-sm">
            {m.canParticipate ? "✋ Visitors can take part" : "👀 Visitors can watch and learn"} · Availability: <b>{m.availability}</b>
          </p>
          {m.rainy && <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm">🌧️ Visiting in a rainy month? Paths may become muddy — check conditions before travelling.</p>}
          <p className="mt-4 text-sm font-semibold">Available experiences</p>
          <ul className="mt-2 space-y-2">
            {EXPERIENCES.filter((e) => m.experiences.includes(e.id)).map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
                <span>{e.title}</span>
                <Link to="/book" search={{ exp: e.id }} className="text-sm font-semibold text-primary">Request</Link>
              </li>
            ))}
          </ul>
        </article>
        <div className="mt-4 space-y-2">
          {EXPERIENCES.map((e) => (
            <p key={e.id} className="text-sm"><b>{e.title}</b> — best time: {range(monthsFor(e.id))}</p>
          ))}
        </div>
      </section>

      <GettingHere />
      <KnowBefore />
      <Planner />
    </Shell>
  );
}

function GettingHere() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  return (
    <section className="px-5 py-6">
      <h2 className="text-2xl font-semibold">Getting here</h2>
      <div className="mt-3 rounded-2xl border bg-card p-5 text-sm">
        <p>📍 Nearest town: {LOCATION.nearestTown}</p>
        <p className="mt-1">📍 Farm: {LOCATION.farm}</p>
      </div>
      <ul className="mt-3 space-y-2">
        {TRANSPORT.options.map((t) => (
          <li key={t.label} className="rounded-xl bg-muted px-4 py-3 text-sm">{t.icon} <b>{t.label}</b> — {t.note}</li>
        ))}
      </ul>
      <div className="mt-4 rounded-2xl border bg-card p-5">
        <h3 className="font-semibold">🚐 Can Noor arrange pickup?</h3>
        <p className="mt-1 text-sm">Pickup: <b>{TRANSPORT.pickup}</b></p>
        {TRANSPORT.pickup !== "No" && (
          <p className="mt-1 text-sm text-muted-foreground">Pickup can be arranged from {TRANSPORT.pickupFrom} with advance notice.</p>
        )}
        {sent ? (
          <p className="mt-4 rounded-xl bg-muted p-3 text-sm">Request sent. Noor will reply to confirm — your pickup isn't booked until she does.</p>
        ) : open ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const g = (k: string) => String(f.get(k) ?? "");
              requestPickup({ name: g("name"), date: g("date"), guests: Number(g("guests")) || 1, location: g("location"), time: g("time"), notes: g("notes") });
              setSent(true);
            }}
          >
            {[
              ["name", "Your name", "text"],
              ["date", "Date", "date"],
              ["guests", "Number of visitors", "number"],
              ["location", "Pickup location", "text"],
              ["time", "Preferred pickup time", "time"],
            ].map(([n, l, t]) => (
              <label key={n} className="block text-sm font-semibold">
                {l}
                <input name={n} type={t} required={n !== "time"} min={t === "number" ? 1 : undefined} className="mt-1 h-12 w-full rounded-xl border bg-background px-3" />
              </label>
            ))}
            <label className="block text-sm font-semibold">
              Notes
              <textarea name="notes" rows={2} className="mt-1 w-full rounded-xl border bg-background p-3" />
            </label>
            <button className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground">Send pickup request</button>
          </form>
        ) : (
          TRANSPORT.pickup !== "No" && (
            <button onClick={() => setOpen(true)} className="mt-4 w-full rounded-full border py-3 font-semibold">Request pickup</button>
          )
        )}
      </div>
    </section>
  );
}

function KnowBefore() {
  return (
    <section className="px-5 py-6">
      <h2 className="text-2xl font-semibold">Know before you go</h2>
      <dl className="mt-3 grid grid-cols-1 gap-2">
        {TERRAIN.map((t) => (
          <div key={t.label} className="rounded-xl bg-muted px-4 py-3">
            <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.label}</dt>
            <dd className="mt-1">{t.icon} {t.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Planner() {
  const [date, setDate] = useState("");
  const [exp, setExp] = useState(EXPERIENCES[0]!.id);
  const [guests, setGuests] = useState(2);
  const idx = monthIndexFromDate(date);
  const month = idx === null ? null : CALENDAR[idx]!;
  const e = EXPERIENCES.find((x) => x.id === exp)!;
  return (
    <section className="px-5 py-8">
      <h2 className="text-2xl font-semibold">Plan your visit</h2>
      <div className="mt-3 space-y-3">
        <label className="block text-sm font-semibold">When
          <input type="date" value={date} onChange={(ev) => setDate(ev.target.value)} className="mt-1 h-12 w-full rounded-xl border bg-card px-3" />
        </label>
        <label className="block text-sm font-semibold">Experience
          <select value={exp} onChange={(ev) => setExp(ev.target.value)} className="mt-1 h-12 w-full rounded-xl border bg-card px-3">
            {EXPERIENCES.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Group size
          <input type="number" min={1} max={8} value={guests} onChange={(ev) => setGuests(+ev.target.value)} className="mt-1 h-12 w-full rounded-xl border bg-card px-3" />
        </label>
      </div>
      {month && (
        <article className="mt-5 space-y-2 rounded-2xl border bg-card p-5 text-sm">
          <h3 className="text-lg font-semibold">Your visit</h3>
          <p>📅 Date: {date} · {guests} visitor(s)</p>
          <p>🌱 Farm activity: {ACTIVITIES[month.activity].icon} {ACTIVITIES[month.activity].label}</p>
          <p>☕ Experience: {e.title} {month.experiences.includes(exp) ? "" : "— not usually offered this month, ask Noor"}</p>
          <p>📍 Getting there: {TRANSPORT.options.map((t) => t.label).join(", ")} · pickup {TRANSPORT.pickup.toLowerCase()}</p>
          <p>🥾 Terrain: {month.rainy ? "Paths may be muddy — " : ""}comfortable walking shoes recommended</p>
          <Link to="/book" search={{ exp }} className="mt-3 block rounded-full bg-primary py-3 text-center font-semibold text-primary-foreground">Send request to Noor</Link>
        </article>
      )}
    </section>
  );
}
