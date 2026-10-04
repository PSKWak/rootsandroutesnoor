import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookingBadge, Shell } from "@/components/rooted";
import { EXPERIENCES, PRICES_ARE_SAMPLE, capacityIssues, estimateTotal, noorDecide, setCapacity, useStore } from "@/lib/store";

export const Route = createFileRoute("/noor/bookings")({
  head: () => ({ meta: [{ title: "Roots & Routes — Noor's Visits" }] }),
  component: Bookings,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Bookings() {
  const bookings = useStore((s) => s.bookings);
  const cap = useStore((s) => s.capacity);
  const [altFor, setAltFor] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [showCap, setShowCap] = useState(false);
  const [off, setOff] = useState("");
  const pending = bookings.filter((b) => b.status === "requested" || b.status === "awaiting");
  const rest = bookings.filter((b) => !pending.includes(b));

  const card = (b: (typeof bookings)[number]) => {
    const open = pending.includes(b);
    const e = EXPERIENCES.find((x) => x.id === b.experienceId);
    const issues = open ? capacityIssues(b, cap) : [];
    return (
      <div key={b.id} className="space-y-3 rounded-3xl border bg-card p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xl font-semibold">📅 {b.date}{b.time ? ` · ${b.time}` : ""}</p>
            <p className="font-semibold">{e?.title}</p>
            <p>👤 {b.name ?? "Visitor"} · {b.guests} guests</p>
            <p className="text-sm text-muted-foreground">💵 About ${estimateTotal(b.experienceId, b.guests)}{PRICES_ARE_SAMPLE ? " (sample price)" : ""}</p>
            {b.contact && <p className="text-sm text-muted-foreground">📞 {b.contact}</p>}
            {b.message && <p className="mt-2 rounded-xl bg-muted p-2 text-sm">"{b.message}"</p>}
          </div>
          <BookingBadge status={b.status} />
        </div>
        {issues.map((i) => <p key={i} className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground">⚠️ {i}</p>)}
        {open && altFor !== b.id && (
          <div className="grid gap-2">
            <button onClick={() => noorDecide(b.id, "confirmed")} className="rounded-full bg-success py-4 text-lg font-semibold text-primary-foreground">✓ Accept</button>
            <button onClick={() => setAltFor(b.id)} className="rounded-full bg-accent py-4 text-lg font-semibold text-accent-foreground">↻ Other day</button>
            <button onClick={() => noorDecide(b.id, "declined")} className="rounded-full bg-destructive py-4 text-lg font-semibold text-destructive-foreground">✕ Decline</button>
            <Link to="/noor/inbox" className="rounded-full border py-4 text-center text-lg font-semibold">💬 Message visitor</Link>
          </div>
        )}
        {altFor === b.id && (
          <div className="flex gap-2">
            <input type="date" aria-label="Other date" value={alt} onChange={(e) => setAlt(e.target.value)} className="h-14 min-w-0 flex-1 rounded-xl border px-3" />
            <button disabled={!alt} onClick={() => { noorDecide(b.id, "alternative", alt); setAltFor(null); setAlt(""); }} className="rounded-full bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-40">Send</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Shell title="Visits" back="/noor">
      <div className="space-y-4 px-5 py-6">
        <button onClick={() => setShowCap(!showCap)} className="w-full rounded-2xl border bg-card p-4 text-left font-semibold">⚙️ My days, times & group size {showCap ? "▴" : "▾"}</button>
        {showCap && (
          <div className="space-y-4 rounded-3xl border bg-card p-5">
            <div>
              <p className="text-sm font-semibold">Open days</p>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {DAYS.map((d, i) => {
                  const on = cap.availableDays.includes(i);
                  return <button key={d} aria-pressed={on} onClick={() => setCapacity({ ...cap, availableDays: on ? cap.availableDays.filter((x) => x !== i) : [...cap.availableDays, i] })} className={`min-h-11 rounded-lg text-xs font-semibold ${on ? "bg-primary text-primary-foreground" : "border"}`}>{d}</button>;
                })}
              </div>
            </div>
            <label className="block text-sm font-semibold">Start times (comma separated)
              <input defaultValue={cap.times.join(", ")} onBlur={(e) => setCapacity({ ...cap, times: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} className="mt-1 h-12 w-full rounded-xl border bg-background px-3" />
            </label>
            {EXPERIENCES.map((e) => (
              <label key={e.id} className="flex items-center justify-between gap-2 text-sm font-semibold">
                Max guests · {e.title}
                <input type="number" min={1} value={cap.maxGuests[e.id] ?? 8} onChange={(ev) => setCapacity({ ...cap, maxGuests: { ...cap.maxGuests, [e.id]: +ev.target.value } })} className="h-11 w-20 rounded-xl border bg-background px-2" />
              </label>
            ))}
            <div>
              <p className="text-sm font-semibold">Days I'm not available</p>
              <div className="mt-2 flex gap-2">
                <input type="date" aria-label="Unavailable date" value={off} onChange={(e) => setOff(e.target.value)} className="h-12 min-w-0 flex-1 rounded-xl border bg-background px-3" />
                <button disabled={!off} onClick={() => { setCapacity({ ...cap, unavailable: [...new Set([...cap.unavailable, off])] }); setOff(""); }} className="rounded-full bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-40">Add</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {cap.unavailable.map((d) => <button key={d} onClick={() => setCapacity({ ...cap, unavailable: cap.unavailable.filter((x) => x !== d) })} className="rounded-full bg-muted px-3 py-1 text-sm">{d} ✕</button>)}
              </div>
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold">Pending requests · {pending.length}</h2>
        {pending.length === 0 && <p className="py-6 text-center text-lg text-muted-foreground">No requests waiting</p>}
        {pending.map(card)}
        {rest.length > 0 && <h2 className="pt-4 text-xl font-semibold">Answered</h2>}
        {rest.map(card)}
      </div>
    </Shell>
  );
}
