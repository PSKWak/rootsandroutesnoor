import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sprout, MessageCircle, Mic, QrCode as QrIcon } from "lucide-react";
import hero from "@/assets/farm-hero.jpg";
import noor from "@/assets/noor.jpg";
import visitorImg from "@/assets/impact-visitor.jpg";
import harvestImg from "@/assets/impact-harvest.jpg";
import cookingImg from "@/assets/impact-cooking.jpg";
import communityImg from "@/assets/impact-community.jpg";
import { AudioPlayer, Shell } from "@/components/rooted";
import { LanguageWelcome } from "@/components/language-welcome";
import { speakTranslation, translateText } from "@/lib/voice.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roots & Routes — Home" },
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
  const [failed, setFailed] = useState(false);
  const [lang, setLang] = useState<"English" | "Swahili">("English");
  const langPick = (
    <div className="mb-2 flex gap-2" role="group" aria-label="Story language">
      {(["English", "Swahili"] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => { setLang(l); setAudio(null); setFailed(false); }} className={`rounded-full px-4 py-2 text-sm font-semibold ${lang === l ? "bg-primary text-primary-foreground" : "border bg-card"}`}>
          {l === "Swahili" ? "Kiswahili" : "English"}
        </button>
      ))}
    </div>
  );
  if (audio) return <div>{langPick}<AudioPlayer big src={audio} label={`Play Noor's story · ${lang === "Swahili" ? "Kiswahili" : "English"}`} /></div>;
  return (
    <div>{langPick}
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true); setFailed(false);
        let text = STORY;
        if (lang === "Swahili") {
          const t = await translateText({ data: { text: STORY, targetLanguage: "Swahili" } }).catch(() => null);
          if (!t?.ok || !t.text) { setBusy(false); setFailed(true); return; }
          text = t.text;
        }
        const r = await speakTranslation({ data: { text } }).catch(() => null);
        setBusy(false);
        if (r?.ok) {
          setAudio(r.audio);
          new Audio(r.audio).play().catch(() => {});
        } else setFailed(true);
      }}
      className="flex w-full items-center gap-4 rounded-3xl border bg-card p-5 text-left shadow-warm"
    >
      {busy ? <Loader2 className="h-8 w-8 animate-spin text-secondary" /> : <Mic className="h-8 w-8 text-secondary" />}
      <span>
        <span className="block text-lg font-semibold">Hear Noor's Story</span>
        <span className="text-xs text-muted-foreground">{busy ? "Preparing the story…" : failed ? "Couldn't play right now — tap to try again" : `AI narrator${lang === "Swahili" ? ", translated by AI" : ""} — not Noor's own voice`}</span>
      </span>
    </button>
    </div>
  );
}

const IMPACT = [
  { img: visitorImg, who: "You", what: "experience local culture first-hand" },
  { img: noor, who: "Noor", what: "earns income from hosting" },
  { img: harvestImg, who: "Local workers", what: "share in the tourism economy" },
  { img: cookingImg, who: "Local suppliers", what: "provide food and products" },
  { img: communityImg, who: "Community", what: "keeps local knowledge alive" },
];


function Home() {
  return (
    <Shell>
      <LanguageWelcome />
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
          {IMPACT.map(({ img, who, what }) => (
            <li key={who} className="flex items-center gap-3">
              <img src={img} alt="" width={640} height={640} loading="lazy" className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-warm" />
              <span className="text-sm leading-snug"><b className="text-base">{who}</b> — {what}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-display text-lg leading-snug">
          Tourism can be more than a transaction — it can support livelihoods, stories, and local knowledge.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Photos are illustrative placeholders, not Noor's community.</p>
      </section>


      <section className="mx-5 mt-6 rounded-3xl border bg-card p-5 text-center">
        <QrIcon className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-2 text-lg font-semibold">Scan to meet Noor</p>
        <p className="text-sm text-muted-foreground">Share Noor's farm page or print its QR code.</p>
        <Link to="/farm" className="mt-3 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Open Noor's farm page</Link>
      </section>

      <footer className="mx-5 my-8 flex justify-center text-sm">
        <Link to="/noor" className="font-semibold text-muted-foreground underline">Host login</Link>
      </footer>
    </Shell>
  );
}
