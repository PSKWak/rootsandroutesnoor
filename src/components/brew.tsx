import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/rooted";
import { ShareButtons } from "@/components/share";
import { listingUrl } from "@/lib/hosts";
import { sendVisitorMessage } from "@/lib/store";

const STEPS = [
  { e: "🌱", t: "Bean" },
  { e: "🫘", t: "Grind" },
  { e: "💧", t: "Brew" },
  { e: "☕", t: "Cup" },
];

export function BrewAnimation() {
  return (
    <section className="mx-5 mt-6 rounded-3xl bg-card p-6 shadow-warm" aria-labelledby="brew-h">
      <h2 id="brew-h" className="text-2xl font-semibold">Bean to cup</h2>
      <Reveal anim="animate-none" className="mt-4">
        <div className="flex items-end justify-between" aria-hidden="true">
          {STEPS.map((s, i) => (
            <div key={s.t} className="flex flex-1 flex-col items-center gap-1">
              <span className={`seq text-3xl animate-pop-in ${i < 2 ? "brew-bean" : ""}`} style={{ animationDelay: `${i * 250}ms` }}>{s.e}</span>
              <span className="text-xs font-semibold">{s.t}</span>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 120 90" className="mx-auto mt-4 h-28 w-36" aria-hidden="true">
          <rect className="brew-pour" x="58" y="0" width="4" height="34" rx="2" fill="var(--secondary)" />
          <path d="M25 35 h70 v30 a20 20 0 0 1 -20 20 h-30 a20 20 0 0 1 -20 -20 z" fill="none" stroke="var(--primary)" strokeWidth="4" />
          <path d="M95 42 a10 10 0 0 1 0 18" fill="none" stroke="var(--primary)" strokeWidth="4" />
          <g className="brew-fill"><path d="M29 45 h62 v20 a16 16 0 0 1 -16 16 h-30 a16 16 0 0 1 -16 -16 z" fill="var(--primary)" opacity=".75" /></g>
          <path className="brew-steam" d="M50 28 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" />
          <path className="brew-steam" style={{ animationDelay: "3.6s" }} d="M70 28 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" />
        </svg>
        <p className="mt-2 text-center font-display text-lg">From Noor's farm to your cup.</p>
        <Link to="/" className="mt-2 block text-center font-semibold text-primary">Hear the story behind this coffee →</Link>
      </Reveal>
    </section>
  );
}

/** Take the story home + optional support. No payments are processed anywhere. */
export function TakeHome() {
  const [asked, setAsked] = useState(false);
  const [tip, setTip] = useState(false);
  return (
    <section className="mx-5 mb-6 space-y-4 rounded-3xl bg-muted p-6">
      <h2 className="text-2xl font-semibold">Take the Story Home</h2>
      <p className="text-sm">Buying Noor's coffee keeps your connection going long after your trip.</p>
      {asked ? (
        <p role="status" className="rounded-2xl bg-card p-3 text-sm font-semibold">Sent to Noor. She'll reply about availability in Ask Noor.</p>
      ) : (
        <button onClick={() => { sendVisitorMessage({ text: "Hello Noor, I'd like to buy some of your coffee. Is it available?" }); setAsked(true); }} className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground">☕ Ask Noor about buying coffee</button>
      )}
      <h3 className="pt-2 text-xl font-semibold">Support Noor <span className="text-sm font-normal">(optional)</span></h3>
      <button onClick={() => setTip(true)} className="w-full rounded-full border bg-card py-3 font-semibold">💛 Tip Noor</button>
      {tip && <p role="status" className="rounded-2xl bg-card p-3 text-sm">Prototype only — tipping isn't connected yet, and no payment was taken. You can thank Noor in person or in Ask Noor.</p>}
      <p className="pt-2 text-sm font-semibold">Share Noor's story</p>
      <ShareButtons url={listingUrl()} text="Meet Noor, a coffee farmer in the Ondera Highlands:" />
    </section>
  );
}
