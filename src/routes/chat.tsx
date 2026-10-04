import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Smartphone } from "lucide-react";
import noor from "@/assets/noor.jpg";
import { AudioPlayer, MsgBadge, Recorder, Shell } from "@/components/rooted";
import { NOOR_LANGUAGE, retryMessage, sendVisitorMessage, useStore } from "@/lib/store";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask Noor — Rooted" },
      { name: "description", content: "Send Noor a text or voice question. She replies in her own voice." },
      { property: "og:title", content: "Ask Noor — Rooted" },
      { property: "og:description", content: "Message a local coffee farmer, translated for her." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Chat,
});

function Chat() {
  const messages = useStore((s) => s.messages);
  const sms = useStore((s) => s.sms);
  const [text, setText] = useState("");
  const visible = messages.filter((m) => m.from === "visitor" || m.status === "delivered");

  return (
    <Shell title="Ask Noor" back="/">
      <div className="space-y-4 px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl bg-muted p-3 text-sm">
          <img src={noor} alt="" width={816} height={816} className="h-10 w-10 rounded-full object-cover" />
          <p>Noor usually replies within a day. She gets an SMS and listens on a shared phone.</p>
        </div>

        {visible.length === 0 && <p className="py-8 text-center text-muted-foreground">Say hello, ask about dates, or anything about the farm.</p>}

        {visible.map((m) =>
          m.from === "visitor" ? (
            <div key={m.id} className="ml-10 space-y-1">
              <div className="rounded-2xl rounded-br-sm bg-primary p-3 text-primary-foreground">
                {m.audio ? <AudioPlayer src={m.audio} label="Your voice message" /> : m.text}
                {m.transcript && <p className="mt-2 text-sm italic opacity-90">"{m.transcript}"</p>}
              </div>
              {m.translated && <p className="rounded-xl bg-card p-2 text-xs text-muted-foreground">Translated for Noor ({NOOR_LANGUAGE}): {m.translated}</p>}
              <div className="flex items-center justify-end gap-3">
                {m.error && <span className="text-xs text-destructive">{m.error}</span>}
                {m.status === "error" && <button onClick={() => retryMessage(m.id)} className="text-xs font-semibold text-primary">Retry</button>}
                <MsgBadge status={m.status} />
              </div>
            </div>
          ) : (
            <div key={m.id} className="mr-10 space-y-2 rounded-2xl rounded-bl-sm border bg-card p-3">
              <p className="text-xs font-semibold text-secondary">Noor — her own voice</p>
              {m.audio && <AudioPlayer src={m.audio} label="Listen to Noor" />}
              {m.translated && <p className="text-sm">{m.translated}</p>}
              <p className="text-xs text-muted-foreground">Translated from {NOOR_LANGUAGE} · reviewed by Noor's family</p>
            </div>
          ),
        )}

        {sms[0] && (
          <div className="flex gap-3 rounded-2xl border-2 border-dashed border-secondary p-3 text-sm">
            <Smartphone className="h-5 w-5 shrink-0 text-secondary" />
            <div>
              <p className="font-semibold">SMS sent to Noor's phone (simulated)</p>
              <p className="text-muted-foreground">"{sms[0].text}"</p>
              <Link to="/noor" className="font-semibold text-primary">Open Noor's companion view →</Link>
            </div>
          </div>
        )}
      </div>

      <form
        className="fixed inset-x-0 bottom-16 mx-auto flex max-w-md flex-wrap items-center gap-2 border-t bg-background p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          sendVisitorMessage({ text: text.trim() });
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write to Noor…"
          className="h-12 min-w-0 flex-1 rounded-full border bg-card px-4 outline-none focus:ring-2 focus:ring-ring"
        />
        {text ? (
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Send">
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <Recorder onDone={(audio) => sendVisitorMessage({ audio })} />
        )}
      </form>
      <div className="h-20" />
    </Shell>
  );
}
