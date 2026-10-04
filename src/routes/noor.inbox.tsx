import { createFileRoute } from "@tanstack/react-router";
import { AudioPlayer, MsgBadge, Recorder, Shell } from "@/components/rooted";
import { approveTranslation, retryMessage, markHeard, sendNoorReply, useStore } from "@/lib/store";

export const Route = createFileRoute("/noor/inbox")({ component: Inbox });

/** Demo-only: speak the translated text so Noor can "listen" to typed messages. */
function speak(text: string) {
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(u);
}

function Inbox() {
  const messages = useStore((s) => s.messages);
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
              <MsgBadge status={m.status} />
            </div>
          ) : (
            <div key={m.id} className="ml-6 space-y-3 rounded-3xl bg-muted p-5">
              <p className="text-sm font-semibold">Your reply</p>
              {m.audio && <AudioPlayer src={m.audio} label="Your voice" />}
              {m.transcript && <p className="text-sm text-muted-foreground">"{m.transcript}"</p>}
              {m.translated && <p className="text-sm">English: {m.translated}</p>}
              <MsgBadge status={m.status} />
              {m.status === "error" && (
                <button onClick={() => retryMessage(m.id)} className="w-full rounded-full border py-4 text-lg font-semibold">↻ Try again</button>
              )}
              {m.status === "review" && m.translated && (
                <button onClick={() => approveTranslation(m.id)} className="w-full rounded-full bg-primary py-4 text-lg font-semibold text-primary-foreground">
                  ✓ Translation is right — send
                </button>
              )}
            </div>
          ),
        )}
        <div className="pt-4">
          <Recorder big label="Record Reply" onDone={sendNoorReply} />
          <p className="mt-2 text-center text-xs text-muted-foreground">Visitors hear your real voice, with a translation below.</p>
        </div>
      </div>
    </Shell>
  );
}
