import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sprout, MessageCircle, Mic, Users, User, Store, Home as HomeIcon, Leaf } from "lucide-react";
import hero from "@/assets/farm-hero.jpg";
import noor from "@/assets/noor.jpg";
import { AudioPlayer, Shell } from "@/components/rooted";
import { speakTranslation } from "@/lib/voice.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roots & Routes — Meet Noor, coffee farmer in the Ondera Highlands" },
      { name: "description", content: "Experience coffee from the people who grow it. Ask Noor questions across languages and visit her family farm." },
      { property: "og:title", content: "Roots & Routes — Meet Noor" },
      { property: "og:description", content: "Experience coffee from the people who grow it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STORY =
  "My grandmother planted the first coffee trees on this hill. Today I care for them with my daughter. Guests come to walk the terraces, help with the harvest, and drink coffee we roast ourselves.";

function HearStory() {
  const [audio, setAudio] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (audio) return <AudioPlayer big src={audio} label="Play Noor's story" />;
  return (
    <button
      onClick={async () => {
        setBusy(true);
        const r = await speakTranslation({ data: { text: STORY } }).catch(() => null);
        setBusy(false);
        if (r?.ok) {
          setAudio(r.audio);
          new Audio(r.audio).play().catch(() => {});
        }
      }}
      className="flex w-full items-center gap-4 rounded-3xl border bg-card p-5 text-left shadow-warm"
    >
      {busy ? <Loader2 className="h-8 w-8 animate-spin text-secondary" /> : <Mic className="h-8 w-8 text-secondary" />}
      <span>
        <span className="block text-lg font-semibold">Hear Noor's Story</span>
        <span className="text-xs text-muted-foreground">Read aloud by a narrator, not Noor's own voice</span>
      </span>
    </button>
  );
}

const IMPACT = [
  { icon: User, who: "You", what: "experience local culture first-hand" },
  { icon: Leaf, who: "Noor", what: "earns income from hosting" },
  { icon: Users, who: "Local workers", what: "take part in the tourism economy" },
  { icon: Store, who: "Local suppliers", what: "provide food, transport and products" },
  { icon: HomeIcon, who: "Community", what: "gains opportunity and reasons to keep local knowledge alive" },
];

const FLOW = ["Discover", "Connect", "Translate", "Experience", "Feel", "Feedback", "Learn", "Improve", "Impact"];

function Home() {
  return (
    <Shell>
      <section className="relative h-[62vh] min-h-[440px] overflow-hidden">
        <img src={hero} alt="Noor's hands holding ripe coffee cherries at sunrise" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-earth-fade" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-90">Roots & Routes · Ondera Highlands</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">Meet Noor. Experience coffee from the people who grow it.</h1>
          <p className="mt-3 text-sm opacity-90">Ask questions, discover the story behind your coffee, and connect with Noor across languages.</p>
        </div>
      </section>

      <section className="-mt-6 relative space-y-3 px-5">
        <Link to="/chat" className="flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground shadow-warm">
          <MessageCircle className="h-9 w-9" />
          <span>
            <span className="block text-xl font-semibold">Ask Noor</span>
            <span className="text-sm opacity-90">Type or speak in your language</span>
          </span>
        </Link>
        <Link to="/experience" className="flex items-center gap-4 rounded-3xl border bg-card p-5 shadow-warm">
          <Sprout className="h-8 w-8 text-secondary" />
          <span className="text-lg font-semibold">Explore the Farm</span>
        </Link>
        <HearStory />
      </section>

      <section className="px-5 py-8">
        <div className="flex items-center gap-4">
          <img src={noor} alt="Noor" width={816} height={816} loading="lazy" className="h-20 w-20 rounded-full object-cover shadow-warm" />
          <div>
            <h2 className="text-2xl font-semibold">Hello, I'm Noor</h2>
            <p className="text-sm text-muted-foreground">Coffee farmer, mother, host · 2-hectare family farm</p>
          </div>
        </div>
        <p className="mt-4 leading-relaxed">"{STORY}"</p>
      </section>

      <section className="mx-5 rounded-3xl bg-muted p-6">
        <h2 className="text-2xl font-semibold">Your Visit Goes Beyond the Farm</h2>
        <ul className="mt-4 space-y-3">
          {IMPACT.map(({ icon: Icon, who, what }) => (
            <li key={who} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span><b>{who}</b> — {what}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 font-display text-lg leading-snug">
          When visitors connect directly with local hosts, tourism can become more than a transaction — it can support livelihoods, stories, and local knowledge.
        </p>
      </section>

      <section className="px-5 py-8">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {FLOW.map((f, i) => (
            <span key={f} className="flex items-center gap-2">
              <span className="rounded-full bg-card px-3 py-1 font-semibold border">{f}</span>
              {i < FLOW.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-5 mb-6 rounded-2xl border border-dashed p-4 text-center text-sm">
        <p className="font-semibold">Demo: choose a view</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to="/chat" className="rounded-full bg-primary py-3 font-semibold text-primary-foreground">Continue as Visitor</Link>
          <Link to="/noor" className="rounded-full bg-secondary py-3 font-semibold text-secondary-foreground">Continue as Noor</Link>
        </div>
      </section>
    </Shell>
  );
}
