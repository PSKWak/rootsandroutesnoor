import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/farm-hero.jpg";
import noor from "@/assets/noor.jpg";
import { Shell } from "@/components/rooted";
import { EXPERIENCES } from "@/lib/store";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rooted — Noor's Coffee Farm, Ondera Highlands" },
      { name: "description", content: "Visit Noor's family coffee farm. Read her story, ask her a question and book a farm experience." },
      { property: "og:title", content: "Rooted — Noor's Coffee Farm" },
      { property: "og:description", content: "Meet Noor and walk her coffee terraces in the Ondera Highlands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Discover,
});

const JOURNEY = [
  { t: "Cherry", d: "Picked by hand when deep red, usually October to January." },
  { t: "Pulp & wash", d: "The fruit is removed and beans washed in spring water." },
  { t: "Sun dry", d: "Beans rest on raised beds for around two weeks." },
  { t: "Roast & share", d: "Roasted in a clay pan over fire, then brewed for guests." },
];

function Discover() {
  return (
    <Shell>
      <section className="relative h-[70vh] min-h-[460px] overflow-hidden">
        <img src={hero} alt="Coffee cherries on Noor's farm at sunrise" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-earth-fade" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground">
          <p className="text-sm font-semibold tracking-widest uppercase opacity-90">Rooted</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">Noor's Coffee Farm</h1>
          <p className="mt-2 flex items-center gap-1 text-sm opacity-90">
            <MapPin className="h-4 w-4" /> Ondera Highlands · 2 hectares · family-run
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="flex items-center gap-4">
          <img src={noor} alt="Noor" width={816} height={816} loading="lazy" className="h-20 w-20 rounded-full object-cover shadow-warm" />
          <div>
            <h2 className="text-2xl font-semibold">Hello, I'm Noor</h2>
            <p className="text-sm text-muted-foreground">Coffee farmer, mother, host</p>
          </div>
        </div>
        <p className="mt-5 leading-relaxed">
          My grandmother planted the first coffee trees on this hill. Today I care for them with my daughter. Guests usually find
          us through friends — they come to walk the terraces, help with the harvest and drink coffee we roast ourselves.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Noor speaks Ondera. Your messages are translated for her, and she replies by voice — you'll hear her own voice.
        </p>
      </section>

      <section className="px-5 pb-8">
        <h2 className="text-2xl font-semibold">The coffee journey</h2>
        <ol className="mt-4 space-y-4 border-l-2 border-accent pl-5">
          {JOURNEY.map((j, i) => (
            <li key={j.t} className="relative">
              <span className="absolute -left-[29px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="font-semibold">{j.t}</h3>
              <p className="text-sm text-muted-foreground">{j.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-5 pb-8">
        <h2 className="text-2xl font-semibold">Experiences</h2>
        <div className="mt-4 space-y-3">
          {EXPERIENCES.map((e) => (
            <article key={e.id} className="rounded-2xl border bg-card p-5 shadow-warm">
              <h3 className="text-lg font-semibold">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>{e.duration} · {e.price}</span>
                <Link to="/book" search={{ exp: e.id }} className="font-semibold text-primary">Request →</Link>
              </div>
            </article>
          ))}
        </div>
        <Link to="/chat" className="mt-6 block rounded-full bg-primary py-4 text-center text-lg font-semibold text-primary-foreground shadow-warm">
          Ask Noor a question
        </Link>
      </section>
    </Shell>
  );
}
