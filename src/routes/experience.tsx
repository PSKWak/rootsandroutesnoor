import { createFileRoute, Link } from "@tanstack/react-router";
import roasting from "@/assets/roasting.jpg";
import { Reveal, Shell } from "@/components/rooted";
import { EXPERIENCES } from "@/lib/store";
import { monthsFor } from "@/lib/farm-info";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "The Coffee Journey — Roots & Routes" },
      { name: "description", content: "From cherry to cup: the people and care behind Noor's coffee, and the farm experiences you can join." },
      { property: "og:title", content: "The Coffee Journey — Roots & Routes" },
      { property: "og:description", content: "This cup has a story. Meet the people behind it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Experience,
});

const STORY = [
  { e: "🌱", t: "Growing", d: "Local farmers care for the coffee plants." },
  { e: "🧺", t: "Harvesting", d: "People carefully pick the coffee cherries." },
  { e: "☀️", t: "Processing", d: "The beans are washed and dried." },
  { e: "🔥", t: "Roasting", d: "The beans are transformed and prepared." },
  { e: "☕", t: "Your Cup", d: "The final experience reaches you." },
];

function Experience() {
  return (
    <Shell title="The Coffee Journey" back="/">
      <section className="mx-5 overflow-hidden rounded-3xl bg-card shadow-warm">
        <img src={roasting} alt="Hands roasting coffee beans in a clay pan over fire" width={1024} height={768} loading="lazy" className="h-48 w-full object-cover" />
        <div className="p-6">
          <Reveal>
            <h2 className="text-2xl font-semibold">This Cup Has a Story</h2>
            <p className="mt-2 text-sm text-muted-foreground">Coffee is not only a product. It carries family, knowledge and local work.</p>
          </Reveal>
          <Reveal anim="animate-none" className="mt-5">
            <ol>
              {STORY.map((s, i) => {
                const last = i === STORY.length - 1;
                return (
                  <li key={s.t}>
                    <div className="flex items-start gap-3">
                      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                        <span className="seq relative block animate-pop-in text-2xl" style={{ animationDelay: `${i * 240}ms` }} aria-hidden="true">
                          {last && <span className="flow-halo seq absolute -inset-2 rounded-full bg-primary animate-halo" />}
                          <span className="seq block animate-bob" style={{ animationDelay: `${i * 420}ms` }}>{s.e}</span>
                        </span>
                      </span>
                      <div className="seq flex-1 animate-slide-in" style={{ animationDelay: `${i * 240 + 70}ms` }}>
                        <p className="font-semibold">{s.t}</p>
                        <p className="text-sm text-muted-foreground">{s.d}</p>
                      </div>
                    </div>
                    {!last && (
                      <div className="relative ml-[15px] h-7 w-0.5" aria-hidden="true">
                        <span className="seq absolute inset-0 origin-top animate-flow-segment bg-primary/25" style={{ animationDelay: `${i * 240 + 150}ms` }} />
                        <span className="flow-drip seq absolute left-1/2 top-0 h-1.5 w-1.5 rounded-full bg-primary animate-drip" style={{ animationDelay: `${i * 240 + 430}ms` }} />
                        <span className="seq absolute -bottom-1 left-1/2 animate-chev text-[10px] leading-none text-primary" style={{ animationDelay: `${i * 240 + 430}ms` }}>▾</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Reveal>
          <Reveal delay={1100}>
            <blockquote className="mt-6 border-l-4 border-primary pl-4 font-display text-lg">
              "Every cup carries a little piece of the people who helped make it."
              <footer className="mt-1 font-sans text-xs text-muted-foreground">— Noor's story</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-8">
        <h2 className="text-2xl font-semibold">Join Noor on the farm</h2>
        <div className="mt-4 space-y-3">
          {EXPERIENCES.map((e) => (
            <article key={e.id} className="rounded-2xl border bg-card p-5">
              <h3 className="text-lg font-semibold">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
              <p className="mt-2 text-xs text-muted-foreground">Best time (sample): {monthsFor(e.id).length === 12 ? "All year" : monthsFor(e.id).map((m) => m.slice(0, 3)).join(", ")}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>{e.duration} · {e.price}</span>
                <Link to="/book" search={{ exp: e.id }} className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground">Request</Link>
              </div>
            </article>
          ))}
        </div>
        <Link to="/visit" className="mt-6 block rounded-full bg-primary py-4 text-center font-semibold text-primary-foreground">Plan your visit — when & how to get here</Link>
        <Link to="/chat" className="mt-3 block rounded-full border py-4 text-center font-semibold">Ask Noor a question</Link>
      </section>
    </Shell>
  );
}
