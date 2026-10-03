import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookingBadge, Shell } from "@/components/rooted";
import { EXPERIENCES, noorDecide, useStore } from "@/lib/store";

export const Route = createFileRoute("/noor/bookings")({ component: Bookings });

function Bookings() {
  const bookings = useStore((s) => s.bookings);
  const [altFor, setAltFor] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  return (
    <Shell title="Booking requests" back="/noor">
      <div className="space-y-4 px-5 py-6">
        {bookings.length === 0 && <p className="py-10 text-center text-lg text-muted-foreground">No requests yet</p>}
        {bookings.map((b) => {
          const open = b.status === "requested" || b.status === "awaiting";
          return (
            <div key={b.id} className="space-y-4 rounded-3xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xl font-semibold">{b.date}</p>
                  <p className="text-muted-foreground">{EXPERIENCES.find((e) => e.id === b.experienceId)?.title} · {b.guests} 👤</p>
                </div>
                <BookingBadge status={b.status} />
              </div>
              {open && altFor !== b.id && (
                <div className="grid gap-2">
                  <button onClick={() => noorDecide(b.id, "confirmed")} className="rounded-full bg-success py-4 text-lg font-semibold text-primary-foreground">✓ Yes</button>
                  <button onClick={() => setAltFor(b.id)} className="rounded-full bg-accent py-4 text-lg font-semibold text-accent-foreground">↻ Other day</button>
                  <button onClick={() => noorDecide(b.id, "declined")} className="rounded-full bg-destructive py-4 text-lg font-semibold text-destructive-foreground">✕ No</button>
                </div>
              )}
              {altFor === b.id && (
                <div className="flex gap-2">
                  <input type="date" value={alt} onChange={(e) => setAlt(e.target.value)} className="h-14 flex-1 rounded-xl border px-3" />
                  <button disabled={!alt} onClick={() => { noorDecide(b.id, "alternative", alt); setAltFor(null); setAlt(""); }} className="rounded-full bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-40">Send</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
