import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BookingBadge, Shell } from "@/components/rooted";
import { EXPERIENCES, PRICES_ARE_SAMPLE, acceptAlternative, estimateTotal, requestBooking, useStore } from "@/lib/store";

export const Route = createFileRoute("/book")({
  validateSearch: (s) => z.object({ exp: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Roots & Routes — Request a Visit" },
      { name: "description", content: "Request a farm experience. Only Noor confirms bookings." },
      { property: "og:title", content: "Request a visit — Roots & Routes" },
      { property: "og:description", content: "Book time on Noor's coffee farm." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Book,
});

const field = "mt-1 h-12 w-full rounded-xl border bg-card px-3";

function Book() {
  const { exp } = Route.useSearch();
  const bookings = useStore((s) => s.bookings);
  const times = useStore((s) => s.capacity.times);
  const [experienceId, setExp] = useState(exp ?? EXPERIENCES[0]!.id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const [step, setStep] = useState<"form" | "review" | "sent">("form");
  const e = EXPERIENCES.find((x) => x.id === experienceId)!;
  const cap = useStore((s) => s.capacity);
  const max = cap.maxGuests[experienceId] ?? 20;
  const today = new Date().toISOString().slice(0, 10);
  const total = estimateTotal(experienceId, Math.min(guests, max));
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const dayIssue = !date ? "" : date < today ? "Please choose a future date." : cap.unavailable.includes(date) || !cap.availableDays.includes(new Date(date + "T00:00:00Z").getUTCDay()) ? "Noor isn't available that day." : "";
  const contactOk = /^\S+@\S+\.\S+$/.test(contact.trim()) || /^\+?\d{7,15}$/.test(contact.replace(/[\s()-]/g, ""));
  const errors = [dayIssue, guests > max ? `This experience takes up to ${max} guests.` : "", contact && !contactOk ? "Enter an email or a phone number like +255 712 345 678." : ""].filter(Boolean);

  return (
    <Shell title="Request a visit" back="/">
      {step === "sent" ? (
        <div className="space-y-3 px-5 py-10 text-center" role="status">
          <h2 className="text-3xl font-semibold">Request sent to Noor.</h2>
          <p className="text-lg">No payment has been taken yet. Noor will confirm availability first.</p>
          <button onClick={() => setStep("form")} className="font-semibold text-primary">Make another request</button>
        </div>
      ) : step === "review" ? (
        <div className="space-y-4 px-5 py-6">
          <h2 className="text-2xl font-semibold">Review your request</h2>
          <dl className="space-y-2 rounded-2xl border bg-card p-5">
            {[["Experience", e.title], ["Date", date], ["Time", time], ["Guests", String(guests)], ["Name", name], ["Contact", contact]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
            ))}
            <div className="border-t pt-2">
              <p className="text-sm">${e.priceUsd} × {plural(guests, "visitor")}</p>
              <p className="text-xl font-bold">Estimated total: ${total}</p>
              {PRICES_ARE_SAMPLE && <p className="text-xs text-muted-foreground">Sample price — Noor will confirm the real price.</p>}
            </div>
          </dl>
          <p className="rounded-2xl bg-muted p-3 text-sm">Payment happens after Noor confirms your request.</p>
          <button
            onClick={() => { requestBooking({ experienceId, date, time, guests, name, contact, ...(message ? { message } : {}) }); setStep("sent"); setDate(""); }}
            className="w-full rounded-full bg-primary py-4 text-lg font-semibold text-primary-foreground shadow-warm"
          >
            Send booking request
          </button>
          <button onClick={() => setStep("form")} className="w-full rounded-full border py-3 font-semibold">Edit</button>
        </div>
      ) : (
        <form className="space-y-5 px-5 py-6" noValidate onSubmit={(ev) => { ev.preventDefault(); if (!date || !time || !name.trim() || !contactOk || errors.length) { setTouched(true); return; } setStep("review"); }}>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">Experience</legend>
            {EXPERIENCES.map((x) => (
              <label key={x.id} className={`block rounded-2xl border-2 p-4 ${experienceId === x.id ? "border-primary bg-card" : "border-transparent bg-muted"}`}>
                <input type="radio" name="exp" className="sr-only" checked={experienceId === x.id} onChange={() => setExp(x.id)} />
                <span className="font-semibold">{x.title}</span>
                <span className="block text-sm text-muted-foreground">{x.duration} · {x.price}{PRICES_ARE_SAMPLE ? " (sample)" : ""}</span>
              </label>
            ))}
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold">Date<input type="date" min={today} required value={date} onChange={(x) => setDate(x.target.value)} className={field} /></label>
            <label className="text-sm font-semibold">Preferred time
              <select required value={time} onChange={(x) => setTime(x.target.value)} className={field}>
                <option value="">Choose</option>
                {times.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm font-semibold">Group size<input type="number" min={1} max={max} required value={guests} onChange={(x) => setGuests(Math.min(max, Math.max(1, +x.target.value || 1)))} className={field} /></label>
          <label className="block text-sm font-semibold">Your name<input required value={name} onChange={(x) => setName(x.target.value)} className={field} /></label>
          <label className="block text-sm font-semibold">How can Noor reach you? (phone, WhatsApp or email)<input required value={contact} onChange={(x) => setContact(x.target.value)} className={field} /></label>
          <label className="block text-sm font-semibold">Message (optional)<textarea rows={2} value={message} onChange={(x) => setMessage(x.target.value)} className="mt-1 w-full rounded-xl border bg-card p-3" /></label>
          {(errors.length > 0 || touched) && (
            <ul role="alert" className="space-y-1 rounded-2xl border-2 border-destructive bg-card p-3 text-sm font-semibold text-destructive">
              {errors.map((m) => <li key={m}>{m}</li>)}
              {touched && (!date || !time || !name.trim() || !contact) && <li>Please fill in date, time, name and contact.</li>}
            </ul>
          )}
          <p className="rounded-2xl bg-muted p-3 text-sm"><b>{e.title}</b><br />${e.priceUsd} × {plural(guests, "visitor")} · <b>Estimated total: ${total}</b></p>
          <button className="w-full rounded-full bg-primary py-4 text-lg font-semibold text-primary-foreground shadow-warm">Review request</button>
          <p className="text-center text-xs text-muted-foreground">This is a request, not a booking. Only Noor can confirm it.</p>
        </form>
      )}

      {bookings.length > 0 && (
        <section className="space-y-3 px-5">
          <h2 className="text-xl font-semibold">Your requests</h2>
          {bookings.map((b) => {
            const x = EXPERIENCES.find((y) => y.id === b.experienceId);
            return (
              <div key={b.id} className={`rounded-2xl border p-4 ${b.status === "confirmed" ? "border-success bg-card shadow-warm" : "bg-card"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{x?.title}</p>
                    <p className="text-sm text-muted-foreground">{b.date}{b.time ? ` · ${b.time}` : ""} · {plural(b.guests, "guest")}</p>
                  </div>
                  <BookingBadge status={b.status} />
                </div>
                {b.status === "confirmed" && <p className="mt-3 text-sm">Noor confirmed your visit. Payment is arranged with Noor directly.</p>}
                {b.status === "alternative" && b.altDate && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
                    <span>Noor suggests <b>{b.altDate}</b></span>
                    <button onClick={() => acceptAlternative(b.id)} className="rounded-full bg-secondary px-4 py-2 font-semibold text-secondary-foreground">Accept</button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </Shell>
  );
}
