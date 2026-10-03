import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BookingBadge, Shell } from "@/components/rooted";
import { EXPERIENCES, acceptAlternative, requestBooking, useStore } from "@/lib/store";

export const Route = createFileRoute("/book")({
  validateSearch: (s) => z.object({ exp: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Request a visit — Rooted" },
      { name: "description", content: "Request a farm experience. Only Noor confirms bookings." },
      { property: "og:title", content: "Request a visit — Rooted" },
      { property: "og:description", content: "Book time on Noor's coffee farm." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Book,
});

function Book() {
  const { exp } = Route.useSearch();
  const bookings = useStore((s) => s.bookings);
  const [experienceId, setExp] = useState(exp ?? EXPERIENCES[0]!.id);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);

  return (
    <Shell title="Request a visit" back="/">
      <form
        className="space-y-5 px-5 py-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!date) return;
          requestBooking({ experienceId, date, guests });
          setDate("");
        }}
      >
        <div className="space-y-2">
          {EXPERIENCES.map((e) => (
            <label key={e.id} className={`block rounded-2xl border-2 p-4 ${experienceId === e.id ? "border-primary bg-card" : "border-transparent bg-muted"}`}>
              <input type="radio" className="sr-only" checked={experienceId === e.id} onChange={() => setExp(e.id)} />
              <span className="font-semibold">{e.title}</span>
              <span className="block text-sm text-muted-foreground">{e.duration} · {e.price}</span>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">
            Date
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-12 w-full rounded-xl border bg-card px-3" />
          </label>
          <label className="text-sm font-semibold">
            Guests
            <input type="number" min={1} max={8} value={guests} onChange={(e) => setGuests(+e.target.value)} className="mt-1 h-12 w-full rounded-xl border bg-card px-3" />
          </label>
        </div>
        <button className="w-full rounded-full bg-primary py-4 text-lg font-semibold text-primary-foreground shadow-warm">Send request to Noor</button>
        <p className="text-center text-xs text-muted-foreground">This is a request, not a booking. Only Noor can confirm it.</p>
      </form>

      {bookings.length > 0 && (
        <section className="space-y-3 px-5">
          <h2 className="text-xl font-semibold">Your requests</h2>
          {bookings.map((b) => {
            const e = EXPERIENCES.find((x) => x.id === b.experienceId);
            return (
              <div key={b.id} className={`rounded-2xl border p-4 ${b.status === "confirmed" ? "border-success bg-card shadow-warm" : "bg-card"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{e?.title}</p>
                    <p className="text-sm text-muted-foreground">{b.date} · {b.guests} guest(s)</p>
                  </div>
                  <BookingBadge status={b.status} />
                </div>
                {b.status === "confirmed" && <p className="mt-3 text-sm">Noor confirmed your visit. Meet at the farm gate at 8:00. See you soon!</p>}
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
