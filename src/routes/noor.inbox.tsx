import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AudioPlayer, MsgBadge, Recorder, Shell } from "@/components/rooted";
import { approveTranslation, discardReply, retryMessage, markHeard, sendNoorReply, sendNoorText, useStore } from "@/lib/store";

export const Route = createFileRoute("/noor/inbox")({
  head: () => ({ meta: [{ title: "Roots & Routes — Noor's Messages" }] }),
  component: Inbox,
});

/** Demo-only: speak the translated text so Noor can "listen" to typed messages. */
function speak(text: string) {
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(u);
}

function Inbox() {
  const messages = useStore((s) => s.messages);
  const lang = useStore((s) => s.noorLanguage);
  const visitorLang = useStore((s) => s.visitorLanguage);
  const [text, setText] = useState("");
  return (
    <Shell title="Messages" back="/noor">
      <div className="space-y-4 px-5 py-6">
        {messages.length === 0 && <p className="py-10 text-center text-lg text-muted-foreground">No messages yet</p>}
        {messages.map((m) =>
          m.from === "visitor" ? (
            <div key={m.id} className="space-y-3 rounded-3xl border bg-card p-5">
              <p className="text-sm font-semibold text-muted-foreground">Visitor {m.heardByNoor ? "· heard" : "· new"}</p>
              {m.audio ? (
                <AudioPlayer big src={m.audio} label="Listen" onPlay={() => markHeard(m.id)} />
              ) : (
                <button onClick={() => { speak(m.translated ?? ""); markHeard(m.id); }} className="w-full rounded-full bg-secondary py-5 text-lg font-semibold text-secondary-foreground">
                  ▶ Listen
                </button>
              )}
              {m.translated && <p className="text-lg">{m.translated}</p>}
              {m.translated && <p className="text-xs text-muted-foreground">Translated by AI into {lang}</p>}
              <MsgBadge status={m.status} />
            </div>
          ) : (
            <div key={m.id} className="ml-6 space-y-3 rounded-3xl bg-muted p-5">
              <p className="text-sm font-semibold">Your reply</p>
              {m.audio && <AudioPlayer src={m.audio} label="Your voice" />}
              {(m.transcript || m.text) && <p className="text-sm text-muted-foreground">"{m.transcript ?? m.text}"</p>}
              {m.translated && <p className="text-sm">{visitorLang} (AI): {m.translated}</p>}
              <MsgBadge status={m.status} />
              {m.status === "error" && (
                <button onClick={() => retryMessage(m.id)} className="w-full rounded-full border py-4 text-lg font-semibold">↻ Try again</button>
              )}
              {m.status === "review" && m.translated && (
                <>
                  <p className="text-sm font-semibold">⚠️ Translation may not be exact.</p>
                  <button onClick={() => approveTranslation(m.id)} className="w-full rounded-full bg-primary py-4 text-lg font-semibold text-primary-foreground">
                    ✓ Translation is right — send
                  </button>
                  <button onClick={() => discardReply(m.id)} className="w-full rounded-full border bg-card py-4 text-lg font-semibold">
                    ✕ This isn't what I meant — try again
                  </button>
                </>
              )}
            </div>
          ),
        )}
        <div className="space-y-3 pt-4">
          <Recorder big label="Record Reply" onDone={sendNoorReply} />
          <p className="text-center text-xs text-muted-foreground">Visitors hear your real voice, with an AI translation below.</p>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { sendNoorText(text.trim()); setText(""); } }}>
            <input aria-label="Type a reply" value={text} onChange={(e) => setText(e.target.value)} placeholder={`…or type in ${lang}`} className="h-12 min-w-0 flex-1 rounded-full border bg-card px-4" />
            <button disabled={!text.trim()} className="rounded-full bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-40">Send</button>
          </form>
        </div>
      </div>
    </Shell>
  );
}
