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

const JOURNEY = [
  { t: "Cherry", d: "Picked by hand when deep red." },
  { t: "Pulp & Wash", d: "Fruit removed, beans washed in spring water." },
  { t: "Sun Dry", d: "Beans rest on raised beds for around two weeks." },
  { t: "Roast & Share", d: "Roasted in a clay pan over fire, brewed for guests." },
];

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
      <section className="px-5 py-6">
        <ol className="space-y-4 border-l-2 border-accent pl-5">
          {JOURNEY.map((j, i) => (
            <li key={j.t} className="relative">
              <span className="absolute -left-[29px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground animate-rise-in" style={{ animationDelay: `${i * 90}ms` }}>{i + 1}</span>
              <Reveal delay={i * 90}>
                <h3 className="font-semibold">{j.t}</h3>
                <p className="text-sm text-muted-foreground">{j.d}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-5 overflow-hidden rounded-3xl bg-card shadow-warm">
        <img src={roasting} alt="Hands roasting coffee beans in a clay pan over fire" width={1024} height={768} loading="lazy" className="h-48 w-full object-cover" />
        <div className="p-6">
          <h2 className="text-2xl font-semibold">This Cup Has a Story</h2>
          <p className="mt-2 text-sm text-muted-foreground">Coffee is not only a product. It carries family, knowledge and local work.</p>
          <ol className="mt-5 space-y-1">
            {STORY.map((s, i) => (
              <li key={s.t}>
                <Reveal delay={i * 120}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl animate-bob" style={{ animationDelay: `${i * 500}ms` }} aria-hidden="true">{s.e}</span>
                    <div>
                      <p className="font-semibold">{s.t}</p>
                      <p className="text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </div>
                </Reveal>
                {i < STORY.length - 1 && (
                  <Reveal delay={i * 120 + 80}>
                    <p className="ml-3 text-muted-foreground animate-arrow-drop" style={{ animationDelay: `${i * 300}ms` }} aria-hidden="true">↓</p>
                  </Reveal>
                )}
              </li>
            ))}
          </ol>
          <Reveal delay={250}>
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
