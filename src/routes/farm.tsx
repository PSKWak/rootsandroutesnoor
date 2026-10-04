import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, CalendarDays, MapPin } from "lucide-react";
import noor from "@/assets/noor.jpg";
import { Shell } from "@/components/rooted";
import { QrCode, ShareButtons } from "@/components/share";
import { HOSTS, listingUrl } from "@/lib/hosts";
import { EXPERIENCES, PRICES_ARE_SAMPLE } from "@/lib/store";
import { CALENDAR, ACTIVITIES, FARM_INFO_IS_PLACEHOLDER } from "@/lib/farm-info";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/farm")({
  head: () => ({
    meta: [
      { title: "Roots & Routes — Noor's Farm" },
      { name: "description", content: "Noor's family coffee farm in the Ondera Highlands: experiences, seasons, how to get there, and Ask Noor." },
      { property: "og:title", content: "Meet Noor — Noor's Farm on Roots & Routes" },
      { property: "og:description", content: "Scan, meet Noor, explore, ask and plan your visit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Farm,
});

function Farm() {
  const host = HOSTS[0]!;
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(listingUrl(host.id)), [host.id]);
  const best = CALENDAR.filter((m) => m.availability === "High").map((m) => m.month.slice(0, 3));

  return (
    <Shell title="Noor's Farm" back="/">
      <div className="space-y-6 px-5 py-6">
        <section className="flex items-center gap-4">
          <img src={noor} alt="Noor, coffee farmer and host" width={816} height={816} className="h-20 w-20 rounded-full object-cover shadow-warm" />
          <div>
            <h2 className="text-2xl font-semibold">{host.name}</h2>
            <p className="text-sm">{host.farmName}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {host.location}</p>
          </div>
        </section>
        <p className="leading-relaxed">"{host.story}"</p>
        <p className="text-sm"><b>Languages:</b> {host.languages.join(" · ")}</p>

        <div className="grid grid-cols-1 gap-2">
          <Link to="/chat" className="flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-lg font-semibold text-primary-foreground shadow-warm"><MessageCircle className="h-5 w-5" /> Ask Noor</Link>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/visit" className="rounded-full border bg-card py-3 text-center font-semibold"><CalendarDays className="mr-1 inline h-4 w-4" />Plan a Visit</Link>
            <Link to="/visit" hash="getting-here" className="rounded-full border bg-card py-3 text-center font-semibold"><MapPin className="mr-1 inline h-4 w-4" />Getting Here</Link>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold">Experiences</h2>
          <ul className="mt-3 space-y-2">
            {EXPERIENCES.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 rounded-2xl border bg-card p-4">
                <span><b className="block">{e.title}</b><span className="text-sm text-muted-foreground">{e.duration} · {e.price}{PRICES_ARE_SAMPLE ? " (sample)" : ""}</span></span>
                <Link to="/book" search={{ exp: e.id }} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Request</Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            {ACTIVITIES.harvest.icon} Busiest season: <b>{best.join(", ")}</b>{FARM_INFO_IS_PLACEHOLDER ? " (sample — awaiting Noor's real seasons)" : ""}
          </p>
        </section>

        <section className="rounded-3xl border-2 border-dashed border-primary bg-card p-5 text-center">
          <h2 className="text-xl font-semibold">Scan to meet Noor</h2>
          <p className="mt-1 text-sm text-muted-foreground">Scan → Meet Noor → Explore → Ask → Plan your visit</p>
          <div className="mt-4">{url && <QrCode url={url} />}</div>
          <p className="mt-2 break-all text-xs text-muted-foreground">{url}</p>
          <button onClick={() => window.print()} className="mt-3 text-sm font-semibold text-primary underline">Print for the farm entrance</button>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Share Noor's experience</h2>
          <div className="mt-3">{url && <ShareButtons url={url} text="Meet Noor, a coffee farmer in the Ondera Highlands:" />}</div>
        </section>

        <p className="rounded-2xl bg-muted p-4 text-center text-sm">🌍 More local hosts coming soon</p>
      </div>
    </Shell>
  );
}
