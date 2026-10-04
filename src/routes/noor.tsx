import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { unlockHost, useStore } from "@/lib/store";

export const Route = createFileRoute("/noor")({
  head: () => ({
    meta: [
      { title: "Roots & Routes — Noor Dashboard" },
      { name: "description", content: "Simple host view: listen to visitors, reply by voice, decide on bookings." },
      { property: "og:title", content: "Host companion — Roots & Routes" },
      { property: "og:description", content: "A simple, voice-first view for local hosts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HostGate,
});

function HostGate() {
  const unlocked = useStore((s) => s.hostUnlocked);
  const [pin, setPin] = useState("");
  const [bad, setBad] = useState(false);
  if (unlocked) return <Outlet />;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 bg-background px-6">
      <Lock className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
      <h1 className="text-center text-3xl font-semibold">Host login</h1>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setBad(!unlockHost(pin));
        }}
      >
        <label className="block text-sm font-semibold">
          PIN
          <input inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} className="mt-1 h-14 w-full rounded-2xl border bg-card px-4 text-center text-2xl tracking-widest" />
        </label>
        {bad && <p role="alert" className="text-center text-sm text-destructive">Wrong PIN</p>}
        <button className="w-full rounded-full bg-primary py-4 text-lg font-semibold text-primary-foreground">Enter</button>
      </form>
      <p className="rounded-2xl bg-muted p-3 text-center text-sm">Demo PIN: <b>1234</b> — prototype only, not real security.</p>
      <Link to="/" className="text-center text-sm text-muted-foreground underline">← Back to visitor app</Link>
    </div>
  );
}
