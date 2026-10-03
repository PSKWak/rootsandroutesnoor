import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, CalendarCheck, MessageCircle, Heart, Lightbulb, Smartphone } from "lucide-react";
import noor from "@/assets/noor.jpg";
import { Shell } from "@/components/rooted";
import { resetDemo, useStore } from "@/lib/store";

export const Route = createFileRoute("/noor/")({ component: Dashboard });

function Dashboard() {
  const s = useStore((x) => x);
  const newEnq = s.messages.filter((m) => m.from === "visitor" && !m.heardByNoor && m.status === "delivered").length;
  const pending = s.bookings.filter((b) => b.status === "awaiting" || b.status === "requested").length;
  const tiles = [
    { to: "/noor/inbox", icon: Mail, label: "New enquiries", n: newEnq, cls: "bg-primary text-primary-foreground" },
    { to: "/noor/bookings", icon: CalendarCheck, label: "Booking requests", n: pending, cls: "bg-secondary text-secondary-foreground" },
    { to: "/noor/inbox", icon: MessageCircle, label: "Messages", n: 0, cls: "bg-card" },
    { to: "/noor/insights", icon: Heart, label: "Visitor feedback", n: 0, cls: "bg-card" },
    { to: "/noor/insights", icon: Lightbulb, label: "Insights", n: 0, cls: "bg-accent text-accent-foreground" },
  ] as const;
  return (
    <Shell>
      <div className="px-5 pt-8">
        <div className="flex items-center gap-3">
          <img src={noor} alt="" width={816} height={816} className="h-14 w-14 rounded-full object-cover" />
          <h1 className="text-3xl font-semibold">Hello Noor</h1>
        </div>
        {s.sms[0] && (
          <div className="mt-5 flex gap-3 rounded-2xl bg-foreground p-4 font-mono text-sm text-background">
            <Smartphone className="h-5 w-5 shrink-0" />
            <p>SMS · {s.sms[0].text}</p>
          </div>
        )}
        <div className="mt-6 grid grid-cols-1 gap-3">
          {tiles.map((t) => (
            <Link key={t.label} to={t.to} className={`flex items-center gap-4 rounded-3xl border p-6 text-xl font-semibold shadow-warm ${t.cls}`}>
              <t.icon className="h-9 w-9" />
              <span className="flex-1">{t.label}</span>
              {t.n > 0 && <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-background px-2 text-foreground">{t.n}</span>}
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-between text-sm">
          <Link to="/" className="text-muted-foreground">← Visitor view</Link>
          <button onClick={resetDemo} className="text-muted-foreground underline">Reset demo</button>
        </div>
      </div>
    </Shell>
  );
}
